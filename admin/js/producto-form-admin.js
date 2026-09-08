(() => {
    const formulario = document.getElementById("producto-form");
    const resultado = document.getElementById("resultado-producto");
    const alerta = document.getElementById("alerta-stock");
    const boton = document.getElementById("guardar-producto");
    const campos = {
        codigo: formulario.elements.codigo, nombre: formulario.elements.nombre,
        descripcion: formulario.elements.descripcion, categoria: formulario.elements.categoria,
        precio: formulario.elements.precio, stock: formulario.elements.stock,
        stockCritico: document.getElementById("stock-critico"), imagen: formulario.elements.imagen
    };
    let codigoOriginal = new URLSearchParams(window.location.search).get("codigo");

    function datosFormulario() {
        return Object.fromEntries(Object.entries(campos).map(([nombre, campo]) => [nombre, campo.value]));
    }

    function erroresFormulario(productos) {
        const errores = ProductosAdmin.validar(datosFormulario(), productos, codigoOriginal);
        // Un input numérico con texto incompleto puede entregar value="".
        for (const nombre of ["precio", "stock", "stockCritico"]) {
            if (campos[nombre].validity.badInput) errores[nombre] = "Ingresa un número válido.";
        }
        return errores;
    }

    function mostrarError(nombre, mensaje) {
        const campo = campos[nombre];
        document.getElementById("error-" + campo.id).textContent = mensaje || "";
        campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
    }

    function mostrarAlerta() {
        const datos = datosFormulario();
        const errores = ProductosAdmin.validar(datos);
        const bajo = !errores.stock && !errores.stockCritico && !campos.stock.validity.badInput &&
            !campos.stockCritico.validity.badInput && datos.stockCritico.trim() !== "" &&
            Number(datos.stock) <= Number(datos.stockCritico);
        alerta.textContent = bajo ? "Atención: el stock es igual o inferior al stock crítico definido." : "";
    }

    function avisar(texto, error = true) {
        resultado.className = "admin-message " + (error ? "admin-message-error" : "admin-message-success");
        resultado.textContent = texto;
    }

    function tituloEdicion() {
        document.getElementById("titulo-producto").textContent = "Editar producto";
        document.getElementById("instrucciones-producto").textContent = "Modifica la información y guarda los cambios del producto.";
        document.title = "ColliClothes - Editar producto";
        boton.textContent = "Guardar cambios";
    }

    try {
        const productos = ProductosAdmin.leer();
        if (codigoOriginal !== null) {
            const producto = productos.find(p => p.codigo === codigoOriginal);
            if (!producto) throw new Error("Producto no encontrado");
            for (const [nombre, campo] of Object.entries(campos)) campo.value = producto[nombre] ?? "";
            tituloEdicion();
            mostrarAlerta();
        }
        boton.disabled = false;
    } catch (error) {
        avisar("No se pudo abrir el formulario: el producto no existe o los datos guardados no se pueden leer. Vuelve al listado.");
        return;
    }

    for (const [nombre, campo] of Object.entries(campos)) {
        for (const evento of ["input", "blur", "change"]) {
            campo.addEventListener(evento, () => {
                resultado.textContent = "";
                try {
                    mostrarError(nombre, erroresFormulario(ProductosAdmin.leer())[nombre]);
                    mostrarAlerta();
                } catch (error) {
                    avisar("No se pudieron leer los productos guardados. Revisa el almacenamiento del navegador.");
                }
            });
        }
    }

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        try {
            const productos = ProductosAdmin.leer();
            const errores = erroresFormulario(productos);
            Object.keys(campos).forEach(nombre => mostrarError(nombre, errores[nombre]));
            const primero = Object.keys(errores)[0];
            if (primero) {
                avisar("Revisa los campos indicados antes de guardar.");
                campos[primero].focus();
                return;
            }
            const datos = datosFormulario();
            const producto = {
                codigo: datos.codigo.trim(), nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim(),
                categoria: datos.categoria, precio: Number(datos.precio), stock: Number(datos.stock),
                stockCritico: datos.stockCritico.trim() === "" ? null : Number(datos.stockCritico), imagen: datos.imagen.trim()
            };
            if (codigoOriginal === null) productos.push(producto);
            else {
                const indice = productos.findIndex(p => p.codigo === codigoOriginal);
                if (indice === -1) {
                    avisar("Este producto fue eliminado. Vuelve al listado antes de continuar.");
                    return;
                }
                productos[indice] = producto;
            }
            ProductosAdmin.guardar(productos);
            codigoOriginal = producto.codigo;
            window.history.replaceState(null, "", "producto-form.html?codigo=" + encodeURIComponent(codigoOriginal));
            tituloEdicion();
            mostrarAlerta();
            avisar("Producto guardado. Puedes volver al listado o continuar editándolo.", false);
            resultado.focus();
        } catch (error) {
            avisar("No se pudo completar el guardado. Revisa el almacenamiento del navegador e inténtalo nuevamente.");
        }
    });
})();
