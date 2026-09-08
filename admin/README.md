# Administración: primera etapa, productos

Abrir `admin/productos.html` usando el mismo servidor local y puerto durante la demostración.

## Implementado

- Listado, creación, edición y eliminación con confirmación.
- Validación al escribir, salir de un campo y enviar el formulario.
- Reglas del Anexo 1, páginas 14–15: código obligatorio de mínimo 3 caracteres; nombre obligatorio de hasta 100; descripción opcional de hasta 500; precio obligatorio no negativo con decimales; stock obligatorio entero no negativo; stock crítico opcional entero no negativo; categoría obligatoria e imagen opcional.
- Alerta cuando el stock es menor o igual al umbral definido. El umbral vacío se guarda como `null`; cero sí activa la alerta para stock cero.
- Regla adicional: código único, sin distinguir mayúsculas y minúsculas.
- Mensajes de error y éxito, foco en el primer campo incorrecto y listado vacío.

## Datos y alcance

Los datos administrativos se guardan en `localStorage`, clave `colliclothes-productos-admin`. Se conservan los tres productos de ejemplo originales del panel; no se asignan umbrales de stock automáticamente. Un arreglo vacío guardado no vuelve a cargar los ejemplos.

Este almacenamiento es local al navegador. Todavía no actualiza el catálogo público, el carrito ni las tarjetas del inicio administrativo. La integración con el catálogo requiere acordar con el compañero los identificadores, precios y la fuente de datos común. No se modificaron sus archivos.

Usuarios, autenticación, permisos y cierre de sesión quedan para las siguientes etapas. Esta etapa no añade navegación móvil; las reglas adaptativas que ya existían en `admin.css` se conservaron.

## Comprobación

Ejecutar desde la raíz: `node --test admin/tests/productos-admin.test.cjs`.

En navegador: crear un producto con precio cero y campos opcionales vacíos; probar precio decimal; rechazar stock decimal; editar y recargar; definir stock igual al umbral; cancelar y confirmar una eliminación; comprobar el listado vacío. Intentar enviar campos obligatorios vacíos y un código repetido.
