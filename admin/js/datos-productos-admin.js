const ProductosAdmin = (() => {
    const clave = "colliclothes-productos-admin";
    const categorias = {
        poleras: "Poleras", polerones: "Polerones", pantalones: "Pantalones",
        chaquetas: "Chaquetas", shorts: "Shorts", accesorios: "Accesorios"
    };
    const iniciales = [
        { codigo: "P001", nombre: "Polera básica", descripcion: "", categoria: "poleras", precio: 9990, stock: 15, stockCritico: null, imagen: "../img/images.jpg" },
        { codigo: "P002", nombre: "Chaqueta militar", descripcion: "", categoria: "chaquetas", precio: 24990, stock: 3, stockCritico: null, imagen: "../img/s-l1600.webp" },
        { codigo: "P003", nombre: "Pantalón de mezclilla", descripcion: "", categoria: "pantalones", precio: 19990, stock: 10, stockCritico: null, imagen: "../img/pantalonboot.webp" }
    ];

    function validar(datos, productos = [], codigoOriginal = null) {
        const errores = {};
        const codigo = datos.codigo.trim();
        if (codigo.length < 3) errores.codigo = "Ingresa un código de al menos 3 caracteres.";
        else if (productos.some(p => p.codigo !== codigoOriginal && p.codigo.toLowerCase() === codigo.toLowerCase())) {
            errores.codigo = "Ya existe un producto con este código.";
        }
        if (!datos.nombre.trim()) errores.nombre = "Ingresa el nombre del producto.";
        else if (datos.nombre.length > 100) errores.nombre = "El nombre admite hasta 100 caracteres.";
        if (datos.descripcion.length > 500) errores.descripcion = "La descripción admite hasta 500 caracteres.";
        if (!Object.hasOwn(categorias, datos.categoria)) errores.categoria = "Selecciona una categoría del listado.";

        for (const campo of ["precio", "stock", "stockCritico"]) {
            const valor = String(datos[campo]).trim();
            if (campo === "stockCritico" && valor === "") continue;
            const numero = Number(valor);
            if (valor === "" || !Number.isFinite(numero) || numero < 0) {
                errores[campo] = "Ingresa un número mayor o igual a cero.";
            } else if (campo !== "precio" && !Number.isInteger(numero)) {
                errores[campo] = "Ingresa un número entero, sin decimales.";
            }
        }
        return errores;
    }

    function leer() {
        const guardado = localStorage.getItem(clave);
        if (guardado === null) return iniciales.map(p => ({ ...p }));
        const productos = JSON.parse(guardado);
        if (!Array.isArray(productos)) throw new Error("Datos inválidos");
        const codigos = new Set();
        for (const p of productos) {
            if (!p || !["codigo", "nombre", "descripcion", "categoria", "imagen"].every(c => typeof p[c] === "string") ||
                typeof p.precio !== "number" || typeof p.stock !== "number" ||
                (p.stockCritico !== null && typeof p.stockCritico !== "number") ||
                Object.keys(validar({ ...p, stockCritico: p.stockCritico ?? "" })).length ||
                codigos.has(p.codigo.toLowerCase())) throw new Error("Datos inválidos");
            codigos.add(p.codigo.toLowerCase());
        }
        return productos;
    }

    function guardar(productos) {
        localStorage.setItem(clave, JSON.stringify(productos));
    }

    function stockBajo(producto) {
        return producto.stockCritico !== null && producto.stock <= producto.stockCritico;
    }

    function precioFormateado(precio) {
        return "$" + precio.toLocaleString("es-CL", { maximumFractionDigits: 20 });
    }

    return { leer, guardar, validar, categorias, stockBajo, precioFormateado };
})();
