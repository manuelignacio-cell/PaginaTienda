// Cada objeto contiene los datos de una prenda.
const productos = [
    {
        nombre: "Polera básica",
        precio: 9990,
        imagen: "../img/images.jpg",
        descripcionImagen: "Polera básica negra",
        ancho: 554,
        alto: 554
    },
    {
        nombre: "Chaqueta Militar",
        precio: 74990,
        imagen: "../img/s-l1600.webp",
        descripcionImagen: "Chaqueta militar verde con parches y bolsillos delanteros",
        ancho: 794,
        alto: 1059
    },
    {
        nombre: "Pantalón de mezclilla",
        precio: 29990,
        imagen: "../img/pantalonboot.webp",
        descripcionImagen: "Pantalón de mezclilla azul con efecto desgastado",
        ancho: 2048,
        alto: 3071
    }
];

// Buscar el espacio del HTML donde se mostrarán las tarjetas.
const listaProductos = document.getElementById("lista-productos");

// Recorrer el arreglo y crear una tarjeta por cada producto.
productos.forEach(function (producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto";

    // Mostrar el precio con separador de miles, por ejemplo: $9.990.
    const precioFormateado = "$" + producto.precio.toLocaleString("es-CL");

    tarjeta.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.descripcionImagen}" width="${producto.ancho}" height="${producto.alto}">
        <h3>${producto.nombre}</h3>
        <p class="precio">${precioFormateado}</p>
    `;

    listaProductos.appendChild(tarjeta);
});
