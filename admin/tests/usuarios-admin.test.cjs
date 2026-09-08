const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function entorno() {
    const almacen = new Map();
    const contexto = vm.createContext({ localStorage: {
        getItem: clave => almacen.get(clave) ?? null,
        setItem: (clave, valor) => almacen.set(clave, valor)
    } });
    for (const archivo of ['regiones-admin.js', 'datos-usuarios-admin.js']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', archivo), 'utf8'), contexto);
    }
    return { api: vm.runInContext('UsuariosAdmin', contexto), regiones: vm.runInContext('RegionesAdmin', contexto), almacen, contexto };
}
const datos = { run: '10000013K', nombre: 'Ana', apellidos: 'Pérez', correo: 'ana@gmail.com',
    fechaNacimiento: '', tipoUsuario: 'cliente', region: 'Metropolitana de Santiago', comuna: 'Santiago',
    direccion: 'Calle 123', password: 'abcd' };

test('RUN: acepta dígitos verificadores numéricos y K; rechaza formato y dígito incorrectos', () => {
    const { api } = entorno();
    assert.equal(api.runValido('10000013K'), true);
    assert.equal(api.runValido('123456785'), true);
    for (const run of ['190110221', '19.011.022-K', 'KKKKKKK', '00000000', '123', '12345678K']) {
        assert.equal(api.runValido(run), false, run);
    }
});
test('catálogo de regiones completo y comunas vinculadas a su región', () => {
    const { api, regiones } = entorno();
    assert.equal(regiones.length, 16);
    assert.equal(regiones.reduce((total, r) => total + r.comunas.length, 0), 346);
    for (const region of regiones) assert.equal(new Set(region.comunas).size, region.comunas.length);
    assert.equal(Object.keys(api.validar(datos)).length, 0);
    assert.ok(api.validar({ ...datos, region: 'Valparaíso' }).comuna);
    assert.ok(api.validar({ ...datos, region: '' }).region);
});
test('valida campos obligatorios y límites exactos de longitud', () => {
    const { api } = entorno();
    for (const campo of ['run', 'nombre', 'apellidos', 'correo', 'tipoUsuario', 'region', 'comuna', 'direccion', 'password']) {
        assert.ok(api.validar({ ...datos, [campo]: '' })[campo], campo);
    }
    for (const [campo, max] of [['nombre', 50], ['apellidos', 100], ['direccion', 300]]) {
        assert.equal(api.validar({ ...datos, [campo]: 'a'.repeat(max) })[campo], undefined);
        assert.ok(api.validar({ ...datos, [campo]: 'a'.repeat(max + 1) })[campo]);
    }
});
test('dominios, perfiles, fechas opcionales y límites de contraseña', () => {
    const { api } = entorno();
    for (const dominio of ['duoc.cl', 'profesor.duoc.cl', 'gmail.com']) {
        assert.equal(api.validar({ ...datos, correo: 'ana@' + dominio }).correo, undefined);
    }
    assert.ok(api.validar({ ...datos, correo: 'ana@gmail.com.ejemplo.com' }).correo);
    assert.ok(api.validar({ ...datos, correo: 'a'.repeat(91) + '@gmail.com' }).correo);
    for (const tipoUsuario of ['administrador', 'cliente', 'vendedor']) {
        assert.equal(api.validar({ ...datos, tipoUsuario }).tipoUsuario, undefined);
    }
    assert.ok(api.validar({ ...datos, tipoUsuario: 'otro' }).tipoUsuario);
    assert.equal(api.validar({ ...datos, fechaNacimiento: '2000-02-29' }).fechaNacimiento, undefined);
    assert.ok(api.validar({ ...datos, fechaNacimiento: '2001-02-29' }).fechaNacimiento);
    for (const password of ['abc', 'a'.repeat(11), '    ']) assert.ok(api.validar({ ...datos, password }).password);
});
test('crea cuentas compatibles con login y normaliza correo y RUN', () => {
    const { api, almacen } = entorno();
    const guardado = api.guardar({ ...datos, correo: ' ANA@GMAIL.COM ', run: '10000013k' });
    assert.equal(guardado.usuario.correo, 'ana@gmail.com');
    assert.equal(guardado.usuario.run, '10000013K');
    const cuentas = JSON.parse(almacen.get('colliclothes-usuarios'));
    assert.ok(cuentas.find(u => u.correo === 'ana@gmail.com' && u.password === 'abcd'));
});
test('rechaza duplicados sin modificar cuentas; permite editar el mismo usuario', () => {
    const { api } = entorno();
    api.guardar(datos);
    const repetido = api.guardar({ ...datos, correo: 'ANA@GMAIL.COM' });
    assert.ok(repetido.errores.run);
    assert.ok(repetido.errores.correo);
    assert.equal(api.leer().length, 1);
    assert.equal(Object.keys(api.guardar({ ...datos, nombre: 'Ana María', password: '' }, datos.correo).errores).length, 0);
    assert.equal(api.leer()[0].password, 'abcd');
    api.guardar({ ...datos, password: 'nueva' }, datos.correo);
    assert.equal(api.leer()[0].password, 'nueva');
});
test('edita cuentas del registro sin región/comuna y conserva campos adicionales', () => {
    const { api, almacen } = entorno();
    const anterior = { ...datos, preferencia: 'ropa' };
    delete anterior.region;
    delete anterior.comuna;
    almacen.set('colliclothes-usuarios', JSON.stringify([anterior]));
    assert.equal(api.leer().length, 1);
    api.guardar({ ...datos, password: '' }, datos.correo);
    assert.equal(api.leer()[0].preferencia, 'ropa');
    assert.equal(api.leer()[0].region, datos.region);
});
test('cambia correo sin duplicar, elimina y detecta una edición de usuario eliminado', () => {
    const { api } = entorno();
    api.guardar(datos);
    api.guardar({ ...datos, correo: 'otro@gmail.com', password: '' }, datos.correo);
    assert.equal(api.leer().length, 1);
    api.eliminar('otro@gmail.com');
    assert.equal(api.leer().length, 0);
    assert.throws(() => api.guardar(datos, 'otro@gmail.com'));
});
test('no sobrescribe almacenamiento corrupto ni anuncia guardado si falla', () => {
    const { api, almacen, contexto } = entorno();
    for (const corrupto of ['{', '{}', '[null]']) {
        almacen.set('colliclothes-usuarios', corrupto);
        assert.throws(() => api.guardar(datos));
        assert.equal(almacen.get('colliclothes-usuarios'), corrupto);
    }
    almacen.delete('colliclothes-usuarios');
    contexto.localStorage.setItem = () => { throw new Error('Sin espacio'); };
    assert.throws(() => api.guardar(datos), /Sin espacio/);
});
