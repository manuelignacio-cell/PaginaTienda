const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function entorno(rol = 'administrador') {
    const almacen = new Map();
    const usuario = { correo: 'admin@duoc.cl', password: '1234', nombre: 'Ana', tipoUsuario: rol };
    almacen.set('colliclothes-usuarios', JSON.stringify([usuario]));
    const contexto = vm.createContext({ URLSearchParams, localStorage: {
        getItem: clave => almacen.get(clave) ?? null,
        setItem: (clave, valor) => almacen.set(clave, valor),
        removeItem: clave => almacen.delete(clave)
    } });
    const cargar = archivo => vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', archivo), 'utf8'), contexto);
    cargar('sesion-admin.js');
    return { api: vm.runInContext('SesionAdmin', contexto), contexto, cargar, almacen, usuario };
}
test('sin sesión no permite rutas protegidas; login comprueba credenciales', () => {
    const { api } = entorno();
    assert.equal(api.permite('admin.html'), false);
    assert.throws(() => api.ingresar('admin@duoc.cl', 'mal'));
    api.ingresar(' ADMIN@DUOC.CL ', '1234');
    for (const pagina of ['admin.html', 'productos.html', 'producto-detalle.html', 'usuarios.html', 'usuario-form.html', 'producto-form.html']) assert.equal(api.permite(pagina), true);
    assert.equal(api.permite('inventada.html'), false);
});
test('vendedor consulta productos y detalle pero no formularios ni usuarios', () => {
    const { api } = entorno('vendedor');
    api.ingresar('admin@duoc.cl', '1234');
    assert.equal(api.permite('productos.html'), true);
    assert.equal(api.permite('producto-detalle.html'), true);
    for (const pagina of ['admin.html', 'producto-form.html', 'usuarios.html', 'usuario-form.html']) assert.equal(api.permite(pagina), false);
    assert.throws(() => api.exigirAdministrador());
});
test('sesión de cliente creada por la tienda no permite acceso administrativo', () => {
    const { api, almacen, usuario } = entorno('cliente');
    assert.throws(() => api.ingresar('admin@duoc.cl', '1234'));
    almacen.set('colliclothes-sesion', JSON.stringify(usuario));
    assert.equal(api.permite('productos.html'), false);
});
test('usa el perfil vigente, detecta cuentas eliminadas y almacenamiento corrupto', () => {
    const { api, almacen, usuario } = entorno();
    api.ingresar('admin@duoc.cl', '1234');
    almacen.set('colliclothes-usuarios', JSON.stringify([{ ...usuario, tipoUsuario: 'cliente' }]));
    assert.equal(api.permite('admin.html'), false);
    almacen.set('colliclothes-usuarios', '[]');
    assert.equal(api.actual(), null);
    almacen.set('colliclothes-usuarios', '{');
    assert.equal(api.actual(), null);
    assert.equal(api.necesitaConfiguracion(), false);
});
test('cerrar sesión no elimina cuentas ni carrito', () => {
    const { api, almacen } = entorno();
    api.ingresar('admin@duoc.cl', '1234');
    almacen.set('colliclothes-carrito', '[{"id":"polera","cantidad":1}]');
    api.cerrar();
    assert.equal(api.actual(), null);
    assert.ok(almacen.has('colliclothes-usuarios'));
    assert.ok(almacen.has('colliclothes-carrito'));
});
test('primer acceso disponible únicamente mientras no exista administrador', () => {
    const { api, almacen, contexto } = entorno();
    contexto.window = { location: { pathname: '/admin/usuario-form.html', search: '?inicial=1' } };
    assert.equal(api.configurando(), false);
    almacen.set('colliclothes-usuarios', '[]');
    assert.equal(api.configurando(), true);
});
test('guardar productos exige permiso vigente incluso después de abrir la página', () => {
    const { api, cargar, contexto, almacen, usuario } = entorno();
    cargar('datos-productos-admin.js');
    const productos = vm.runInContext('ProductosAdmin', contexto);
    api.ingresar('admin@duoc.cl', '1234');
    productos.guardar([]);
    almacen.set('colliclothes-usuarios', JSON.stringify([{ ...usuario, tipoUsuario: 'vendedor' }]));
    assert.throws(() => productos.guardar([]));
});

test('último administrador se conserva y cambiar su contraseña invalida la sesión', () => {
    const { api, cargar, contexto, almacen, usuario } = entorno();
    const completo = { ...usuario, run: '10000013K', apellidos: 'Pérez', direccion: 'Calle 123',
        fechaNacimiento: '', region: 'Metropolitana de Santiago', comuna: 'Santiago' };
    almacen.set('colliclothes-usuarios', JSON.stringify([completo]));
    cargar('regiones-admin.js');
    cargar('datos-usuarios-admin.js');
    const usuarios = vm.runInContext('UsuariosAdmin', contexto);
    api.ingresar(usuario.correo, '1234');
    assert.throws(() => usuarios.eliminar(usuario.correo), /último administrador/);
    assert.ok(usuarios.guardar({ ...completo, tipoUsuario: 'cliente' }, usuario.correo).errores.tipoUsuario);
    usuarios.guardar({ ...completo, password: '5678' }, usuario.correo);
    assert.equal(api.actual(), null);
    assert.throws(() => api.ingresar(usuario.correo, '1234'));
    api.ingresar(usuario.correo, '5678');
});

test('configuración inicial solo crea administrador y se cierra después de crearlo', () => {
    const { api, cargar, contexto, almacen } = entorno();
    almacen.set('colliclothes-usuarios', '[]');
    contexto.window = { location: { pathname: '/admin/usuario-form.html', search: '?inicial=1' } };
    cargar('regiones-admin.js');
    cargar('datos-usuarios-admin.js');
    const usuarios = vm.runInContext('UsuariosAdmin', contexto);
    const datos = { correo: 'ana@duoc.cl', password: '1234', run: '10000013K', nombre: 'Ana', apellidos: 'Pérez',
        direccion: 'Calle 123', fechaNacimiento: '', region: 'Metropolitana de Santiago', comuna: 'Santiago', tipoUsuario: 'cliente' };
    assert.throws(() => usuarios.guardar(datos));
    usuarios.guardar({ ...datos, tipoUsuario: 'administrador' });
    assert.equal(api.configurando(), false);
    assert.throws(() => usuarios.guardar(datos));
});
