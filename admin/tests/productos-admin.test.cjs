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
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/datos-productos.js'), 'utf8'), contexto);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/datos-productos-admin.js'), 'utf8'), contexto);
    return { api: vm.runInContext('ProductosAdmin', contexto), almacen, contexto };
}

const valido = { codigo: 'P004', nombre: 'Polera', descripcion: '', categoria: 'poleras', precio: '0', stock: '0', stockCritico: '', imagen: '' };

test('usa nombres, precios e imágenes del catálogo original sin modificarlo', () => {
    const { api, contexto } = entorno();
    const origen = vm.runInContext('productos', contexto);
    const antes = JSON.stringify(origen);
    api.leer().forEach((p, i) => {
        assert.equal(p.nombre, origen[i].nombre);
        assert.equal(p.precio, origen[i].precio);
        assert.equal(p.imagen, origen[i].imagen);
    });
    const guardados = api.leer();
    guardados[1].precio = 24990;
    guardados[1].stock = 80;
    guardados[1].stockCritico = 10;
    api.guardar(guardados);
    assert.equal(api.leer()[1].precio, 24990);
    api.actualizarDesdeTienda();
    assert.equal(api.leer()[1].precio, origen[1].precio);
    assert.equal(api.leer()[1].stock, 80);
    assert.equal(api.leer()[1].stockCritico, 10);
    assert.equal(JSON.stringify(origen), antes);
});

test('acepta precio gratis, decimales y campos opcionales vacíos', () => {
    const { api } = entorno();
    for (const precio of ['0', '19990.75']) assert.equal(Object.keys(api.validar({ ...valido, precio })).length, 0);
});

test('rechaza obligatorios vacíos, categoría ajena y valores numéricos inválidos', () => {
    const { api } = entorno();
    for (const campo of ['codigo', 'nombre', 'categoria', 'precio', 'stock']) {
        assert.ok(api.validar({ ...valido, [campo]: '' })[campo]);
    }
    assert.ok(api.validar({ ...valido, categoria: 'otra' }).categoria);
    for (const campo of ['precio', 'stock', 'stockCritico']) {
        for (const valor of ['-1', 'Infinity', 'abc']) assert.ok(api.validar({ ...valido, [campo]: valor })[campo]);
    }
    for (const campo of ['stock', 'stockCritico']) assert.ok(api.validar({ ...valido, [campo]: '1.5' })[campo]);
});

test('respeta los límites exactos de texto de la pauta', () => {
    const { api } = entorno();
    assert.equal(Object.keys(api.validar({ ...valido, codigo: 'ABC', nombre: 'x'.repeat(100), descripcion: 'x'.repeat(500) })).length, 0);
    assert.ok(api.validar({ ...valido, codigo: 'AB' }).codigo);
    assert.ok(api.validar({ ...valido, nombre: 'x'.repeat(101) }).nombre);
    assert.ok(api.validar({ ...valido, descripcion: 'x'.repeat(501) }).descripcion);
});

test('impide duplicados, permite editar el mismo código y detecta colisiones al cambiarlo', () => {
    const { api } = entorno();
    const productos = api.leer();
    assert.ok(api.validar({ ...valido, codigo: 'p001' }, productos).codigo);
    assert.equal(api.validar({ ...valido, codigo: 'P001' }, productos, 'P001').codigo, undefined);
    assert.ok(api.validar({ ...valido, codigo: 'P002' }, productos, 'P001').codigo);
});

test('stock crítico distingue umbral vacío, cero y valores iguales al stock', () => {
    const { api } = entorno();
    assert.equal(api.stockBajo({ stock: 0, stockCritico: null }), false);
    assert.equal(api.stockBajo({ stock: 0, stockCritico: 0 }), true);
    assert.equal(api.stockBajo({ stock: 5, stockCritico: 5 }), true);
    assert.equal(api.stockBajo({ stock: 6, stockCritico: 5 }), false);
});

test('persisten creación, edición y eliminación sin reponer ejemplos tras vaciar', () => {
    const { api } = entorno();
    const productos = api.leer();
    productos.push({ ...valido, precio: 12.5, stock: 0, stockCritico: null });
    api.guardar(productos);
    assert.equal(api.leer().length, 4);
    productos[3].nombre = 'Nombre editado';
    api.guardar(productos);
    assert.equal(api.leer()[3].nombre, 'Nombre editado');
    api.guardar(productos.filter(p => p.codigo !== 'P004'));
    assert.equal(api.leer().length, 3);
    api.guardar([]);
    assert.equal(api.leer().length, 0);
});

test('datos corruptos no se reemplazan silenciosamente', () => {
    const { api, almacen } = entorno();
    for (const corrupto of ['{', '{}', '[null]', '[{"codigo":"P001"}]']) {
        almacen.set('colliclothes-productos-admin', corrupto);
        assert.throws(() => api.leer());
        assert.equal(almacen.get('colliclothes-productos-admin'), corrupto);
    }
});

test('un fallo al guardar se propaga y conserva los datos anteriores', () => {
    const { api, contexto } = entorno();
    api.guardar(api.leer());
    contexto.localStorage.setItem = () => { throw new Error('Sin espacio'); };
    assert.throws(() => api.guardar([]), /Sin espacio/);
    assert.equal(api.leer().length, 3);
});
