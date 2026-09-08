// Elementos del formulario.
const formulario = document.getElementById("formulario-contacto");
const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const comentario = document.getElementById("comentario");
const resultado = document.getElementById("resultado-contacto");
const contador = document.getElementById("contador-comentario");
const campos = [nombre, correo, comentario];

// Reglas de contacto. El correo es obligatorio para poder responder la consulta.
function validarCampo(campo) {
    const valor = campo.value.trim();
    let mensaje = "";

    if (campo === nombre) {
        if (valor === "") {
            mensaje = "Escribe tu nombre.";
        } else if (campo.value.length > 100) {
            mensaje = "El nombre no puede superar los 100 caracteres.";
        }
    }

    if (campo === correo) {
        if (valor === "") {
            mensaje = "Escribe tu correo para que podamos responder tu consulta.";
        } else if (campo.value.length > 100) {
            mensaje = "El correo no puede superar los 100 caracteres.";
        } else if (valor !== "" && !/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(valor)) {
            mensaje = "Revisa el correo ingresado. Puedes usar una dirección de Gmail.";
        }
    }

    if (campo === comentario) {
        if (valor === "") {
            mensaje = "Escribe un comentario.";
        } else if (campo.value.length > 500) {
            mensaje = "El comentario no puede superar los 500 caracteres.";
        }
    }

    document.getElementById("error-" + campo.id).textContent = mensaje;
    campo.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
    return mensaje === "";
}

// Revisar cada campo mientras se escribe y al salir de él.
campos.forEach(function (campo) {
    campo.addEventListener("input", function () {
        resultado.textContent = "";
        validarCampo(campo);
        contador.textContent = comentario.value.length + " / 500 caracteres";
    });

    campo.addEventListener("blur", function () {
        validarCampo(campo);
    });
});

formulario.addEventListener("submit", function (evento) {
    // Evitar que se recargue la página o se envíen datos sin un servicio de envío.
    evento.preventDefault();
    resultado.textContent = "";
    let primerCampoConError = null;

    campos.forEach(function (campo) {
        if (!validarCampo(campo) && primerCampoConError === null) {
            primerCampoConError = campo;
        }
    });

    if (primerCampoConError !== null) {
        primerCampoConError.focus();
        return;
    }

    resultado.textContent = "Los datos son válidos. El mensaje aún no se ha enviado porque el envío no está disponible.";
});

document.getElementById("enviar").disabled = false;
