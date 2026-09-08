(() => {
    const tabla = document.getElementById("lista-productos-admin");
    const mensaje = document.getElementById("resultado-productos");

    function avisar(texto, error = false) {
        mensaje.textContent = texto;
        mensaje.className = error ? "admin-message admin-message-error" : "admin-message admin-message-success";
    }

    function mostrar() {
        try {
            const productos = ProductosAdmin.leer();
            tabla.replaceChildren();
            document.getElementById("productos-vacios").hidden = productos.length !== 0;
            productos.forEach(producto => {
                const fila = document.createElement("tr");
                [producto.codigo, producto.nombre, ProductosAdmin.categorias[producto.categoria],
                    ProductosAdmin.precioFormateado(producto.precio), producto.stock].forEach(valor => {
                    const celda = document.createElement("td");
                    celda.textContent = valor;
                    fila.appendChild(celda);
                });
                if (ProductosAdmin.stockBajo(producto)) {
                    const alerta = document.createElement("span");
                    alerta.className = "stock-alert";
                    alerta.textContent = "Stock crítico (umbral: " + producto.stockCritico + ")";
                    fila.lastElementChild.appendChild(alerta);
                }
                const acciones = document.createElement("td");
                const grupo = document.createElement("div");
                grupo.className = "table-actions";
                const editar = document.createElement("a");
                editar.className = "edit-button";
                editar.href = "producto-form.html?codigo=" + encodeURIComponent(producto.codigo);
                editar.textContent = "Editar";
                editar.setAttribute("aria-label", "Editar " + producto.nombre);
                const eliminar = document.createElement("button");
                eliminar.type = "button";
                eliminar.className = "delete-button";
                eliminar.textContent = "Eliminar";
                eliminar.setAttribute("aria-label", "Eliminar " + producto.nombre);
                eliminar.addEventListener("click", () => {
                    if (!window.confirm('¿Eliminar el producto "' + producto.nombre + '"?')) return;
                    try {
                        const actuales = ProductosAdmin.leer();
                        if (!actuales.some(p => p.codigo === producto.codigo)) {
                            mostrar();
                            avisar("Este producto ya no existe. Se actualizó el listado.", true);
                            return;
                        }
                        ProductosAdmin.guardar(actuales.filter(p => p.codigo !== producto.codigo));
                        mostrar();
                        avisar("Producto eliminado: " + producto.nombre + ".");
                        mensaje.focus();
                    } catch (error) {
                        avisar("No se pudo eliminar el producto. Revisa el almacenamiento del navegador.", true);
                    }
                });
                grupo.append(editar, eliminar);
                acciones.appendChild(grupo);
                fila.appendChild(acciones);
                tabla.appendChild(fila);
            });
        } catch (error) {
            avisar("No se pudieron leer los productos guardados. No se sobrescribieron los datos.", true);
        }
    }

    mostrar();
})();
