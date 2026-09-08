(() => {
    if (!SesionAdmin.permite("producto-detalle.html")) return;
    const contenido = document.getElementById("detalle-producto");
    try {
        const codigo = new URLSearchParams(window.location.search).get("codigo");
        const producto = ProductosAdmin.leer().find(p => p.codigo === codigo);
        if (!producto) throw new Error("El producto no existe. Vuelve al listado.");
        document.getElementById("titulo-detalle").textContent = producto.nombre;
        const lista = document.createElement("dl");
        lista.className = "product-details";
        for (const [etiqueta, valor] of [["Código", producto.codigo], ["Descripción", producto.descripcion || "Sin descripción"],
            ["Categoría", ProductosAdmin.categorias[producto.categoria]], ["Precio", ProductosAdmin.precioFormateado(producto.precio)],
            ["Stock", producto.stock], ["Stock crítico", producto.stockCritico ?? "No definido"]]) {
            const termino = document.createElement("dt");
            termino.textContent = etiqueta;
            const dato = document.createElement("dd");
            dato.textContent = valor;
            lista.append(termino, dato);
        }
        contenido.appendChild(lista);
        if (ProductosAdmin.stockBajo(producto)) {
            const alerta = document.createElement("p");
            alerta.className = "admin-message admin-message-warning";
            alerta.textContent = "Atención: este producto tiene stock crítico.";
            contenido.appendChild(alerta);
        }
    } catch (error) { contenido.textContent = error.message; }
})();
