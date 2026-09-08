# ColliClothes

Tienda de ropa desarrollada para la primera evaluación de Desarrollo Fullstack II.
Proyecto grupal con HTML, CSS y JavaScript, sin frameworks.

## Estructura del proyecto

- `css/`: hojas de estilos.
- `js/`: scripts para formularios, productos y carrito.
- `img/`: imágenes de ropa y logo de la tienda.
- `pages/`: páginas de la tienda, como productos, registro y contacto.
- `admin/`: páginas para administrar productos y usuarios.
- `README.md`: descripción y organización del proyecto.

La página principal es `index.html`, ubicada en la raíz.
Cada carpeta vacía contiene un archivo `.gitkeep` para que Git pueda incluirla en el repositorio. Se puede eliminar cuando se agreguen archivos a esa carpeta.

## Estado actual

Página principal con estructura HTML básica: encabezado, navegación entre páginas, bienvenida, enlace al catálogo y pie de página. Incluye estilos básicos en `css/style.css` para los colores, la fuente, los espacios y el menú horizontal. La página de contacto utiliza JavaScript para validar su formulario.

La página `pages/productos.html` muestra tres prendas de ejemplo con nombre, precio en pesos chilenos y fotos reales guardadas en `img/`. La polera, la chaqueta militar y el pantalón tienen fotos. Las tarjetas se acomodan al ancho de la pantalla mediante CSS. El listado se genera desde un arreglo en `js/datos-productos.js` y se dibuja con `js/productos.js`, usando un ciclo `forEach` para crear las tarjetas. Cada tarjeta enlaza a un detalle HTML propio y permite agregar la prenda al carrito.

El inicio presenta la tienda con el mensaje «Prendas con historia. Estilo propio.», un enlace al catálogo y una sección sobre moda y cultura. Utiliza las fotos `img/inicioweb.jpg` e `img/traviscineweb.jpg`, con una distribución que se adapta a celulares mediante CSS.

Para verla, abrir `index.html` en un navegador.

La página `pages/nosotros.html` cuenta el origen de ColliClothes y presenta a los integrantes: Cristóbal Colli, Manuel Araya e Ignacio Pérez. Comparte los estilos del inicio y se accede desde el menú de navegación.

La página `pages/contacto.html` valida los datos en tiempo real y al pulsar Enviar mediante `js/contacto.js`: nombre obligatorio de hasta 100 caracteres; correo obligatorio para responder las consultas, de hasta 100 caracteres con dominio duoc.cl, profesor.duoc.cl o gmail.com; comentario obligatorio de hasta 500 caracteres. Muestra errores y un contador de caracteres. No envía ni almacena mensajes: falta integrar un servicio de envío.

Las páginas `pages/registro.html` y `pages/login.html` permiten crear una cuenta de cliente e iniciar sesión. El registro valida RUN sin puntos ni guion, nombre, apellidos, correo, dirección y contraseña. El inicio de sesión revisa el correo y contraseña contra los usuarios guardados. Como el proyecto es solo frontend, los usuarios y la sesión se guardan en localStorage del navegador.

## Forma de trabajo

El desarrollo se realizará por etapas, distribuyendo las tareas entre los
integrantes y registrando cada avance con un commit descriptivo.

## Detalles y carrito

Cada prenda tiene una página de detalle con foto, descripción, precio y botón para agregar al carrito. Los precios de los detalles están escritos en HTML y deben actualizarse junto con el arreglo de productos.

El carrito permite agregar desde catálogo y detalle, cambiar cantidades, quitar prendas y vaciar la lista. Una prenda repetida aumenta su cantidad. Se permiten cantidades enteras de 1 a 99 por prenda; es un límite de la compra, no un stock real. El total suma precio por cantidad en pesos chilenos. No incluye pagos ni envío de pedidos.

La información se guarda en localStorage del navegador. Para compartir correctamente el carrito entre páginas, abre el proyecto con un servidor local, por ejemplo Live Server en VS Code, usando siempre la misma dirección y puerto. Al abrir archivos directamente, el almacenamiento puede variar entre páginas según el navegador.
