// Compartimos el carrito entre el catálogo, los detalles y la página del carrito.
// Solo guardamos el identificador y la cantidad; el precio viene del catálogo.
let carrito = [];
const mensajeCarrito = document.getElementById("mensaje-carrito");
const listaCarrito = document.getElementById("lista-carrito");

function avisar(mensaje) {
    mensajeCarrito.textContent = mensaje;
}

try {
    const guardado = JSON.parse(localStorage.getItem("colliclothes-carrito") || "[]");
    if (!Array.isArray(guardado)) {
        throw new Error("Carrito inválido");
    }
    guardado.forEach(function (item) {
        if (item && productos.some(function (producto) { return producto.id === item.id; }) &&
            Number.isInteger(item.cantidad) && item.cantidad >= 1 && item.cantidad <= 99 &&
            !carrito.some(function (producto) { return producto.id === item.id; })) {
            carrito.push({ id: item.id, cantidad: item.cantidad });
        }
    });
} catch (error) {
    avisar("No se pudo recuperar el carrito guardado. Puedes comenzar uno nuevo.");
}

function guardarCarrito() {
    try {
        localStorage.setItem("colliclothes-carrito", JSON.stringify(carrito));
        return true;
    } catch (error) {
        avisar("El cambio funciona en esta página, pero no se pudo guardar. Revisa los permisos de almacenamiento del navegador.");
        return false;
    }
}

function agregarAlCarrito(id) {
    const producto = productos.find(function (producto) { return producto.id === id; });
    if (!producto) return;
    const existente = carrito.find(function (item) { return item.id === id; });
    if (existente) {
        if (existente.cantidad >= 99) {
            avisar("Puedes agregar hasta 99 unidades por prenda.");
            return;
        }
        existente.cantidad++;
    } else {
        carrito.push({ id: id, cantidad: 1 });
    }
    if (guardarCarrito()) avisar(producto.nombre + " se agregó al carrito.");
}

// Estos botones están en el catálogo y en cada detalle.
document.querySelectorAll("[data-producto]").forEach(function (boton) {
    boton.addEventListener("click", function () {
        agregarAlCarrito(boton.dataset.producto);
    });
});

function mostrarCarrito() {
    if (!listaCarrito) return;
    listaCarrito.innerHTML = "";
    let total = 0;
    document.getElementById("carrito-vacio").hidden = carrito.length !== 0;
    document.getElementById("vaciar-carrito").disabled = carrito.length === 0;

    carrito.forEach(function (item) {
        const producto = productos.find(function (producto) { return producto.id === item.id; });
        const subtotal = producto.precio * item.cantidad;
        total += subtotal;
        const fila = document.createElement("article");
        fila.className = "fila-carrito";
        fila.innerHTML = `
            <h3>${producto.nombre}</h3>
            <p>Precio: $${producto.precio.toLocaleString("es-CL")}</p>
            <label for="cantidad-${item.id}">Cantidad (1 a 99)</label>
            <input id="cantidad-${item.id}" type="number" min="1" max="99" step="1" value="${item.cantidad}">
            <p>Subtotal: <strong>$${subtotal.toLocaleString("es-CL")}</strong></p>
            <button class="boton-tienda" type="button" aria-label="Quitar ${producto.nombre}">Quitar</button>
        `;
        fila.querySelector("input").addEventListener("change", function (evento) {
            const cantidad = Number(evento.target.value);
            if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
                evento.target.value = item.cantidad;
                avisar("La cantidad debe ser un número entero entre 1 y 99.");
                return;
            }
            item.cantidad = cantidad;
            if (guardarCarrito()) avisar("Cantidad actualizada.");
            mostrarCarrito();
            document.getElementById("cantidad-" + item.id).focus();
        });
        fila.querySelector("button").addEventListener("click", function () {
            carrito = carrito.filter(function (producto) { return producto.id !== item.id; });
            if (guardarCarrito()) avisar(producto.nombre + " se quitó del carrito.");
            mostrarCarrito();
            document.getElementById("titulo-carrito").focus();
        });
        listaCarrito.appendChild(fila);
    });
    document.getElementById("total-carrito").textContent = "$" + total.toLocaleString("es-CL");
}

if (listaCarrito) {
    document.getElementById("vaciar-carrito").addEventListener("click", function () {
        carrito = [];
        if (guardarCarrito()) avisar("El carrito se vació.");
        mostrarCarrito();
        document.getElementById("titulo-carrito").focus();
    });
    mostrarCarrito();
}
