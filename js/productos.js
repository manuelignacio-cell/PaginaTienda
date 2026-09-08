// Los datos se cargan primero desde datos-productos.js.
const listaProductos = document.getElementById("lista-productos");

productos.forEach(function (producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto";
    tarjeta.innerHTML = `
        <a class="enlace-producto" href="${producto.detalle}">
            <img src="${producto.imagen}" alt="${producto.descripcionImagen}" width="${producto.ancho}" height="${producto.alto}">
            <h3>${producto.nombre}</h3>
        </a>
        <p class="precio">$${producto.precio.toLocaleString("es-CL")}</p>
        <button class="boton-tienda" type="button" data-producto="${producto.id}">Agregar al carrito</button>
    `;
    listaProductos.appendChild(tarjeta);
});
