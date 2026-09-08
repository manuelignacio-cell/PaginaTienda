const formularioRegistro = document.getElementById("formulario-registro");
const run = document.getElementById("run");
const nombre = document.getElementById("nombre");
const apellidos = document.getElementById("apellidos");
const correo = document.getElementById("correo");
const fechaNacimiento = document.getElementById("fecha-nacimiento");
const direccion = document.getElementById("direccion");
const password = document.getElementById("password");
const resultadoRegistro = document.getElementById("resultado-registro");
const camposRegistro = [run, nombre, apellidos, correo, direccion, password];
const claveUsuarios = "colliclothes-usuarios";
const claveSesion = "colliclothes-sesion";

function obtenerUsuarios() {
    try {
        const usuariosGuardados = JSON.parse(localStorage.getItem(claveUsuarios)) || [];
        return Array.isArray(usuariosGuardados) ? usuariosGuardados : [];
    } catch (error) {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(claveUsuarios, JSON.stringify(usuarios));
}

function correoValido(valor) {
    return /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(valor);
}

function validarCampoRegistro(campo) {
    const valor = campo.value.trim();
    let mensaje = "";

    if (campo === run) {
        if (valor === "") {
            mensaje = "Escribe tu RUN.";
        } else if (!/^[0-9kK]{7,9}$/.test(valor)) {
            mensaje = "El RUN debe tener entre 7 y 9 caracteres, sin puntos ni guion.";
        }
    }

    if (campo === nombre) {
        if (valor === "") {
            mensaje = "Escribe tu nombre.";
        } else if (campo.value.length > 50) {
            mensaje = "El nombre no puede superar los 50 caracteres.";
        }
    }

    if (campo === apellidos) {
        if (valor === "") {
            mensaje = "Escribe tus apellidos.";
        } else if (campo.value.length > 100) {
            mensaje = "Los apellidos no pueden superar los 100 caracteres.";
        }
    }

    if (campo === correo) {
        if (valor === "") {
            mensaje = "Escribe tu correo.";
        } else if (campo.value.length > 100) {
            mensaje = "El correo no puede superar los 100 caracteres.";
        } else if (!correoValido(valor)) {
            mensaje = "El correo debe usar un dominio permitido.";
        }
    }

    if (campo === direccion) {
        if (valor === "") {
            mensaje = "Escribe tu dirección.";
        } else if (campo.value.length > 300) {
            mensaje = "La dirección no puede superar los 300 caracteres.";
        }
    }

    if (campo === password) {
        if (valor === "") {
            mensaje = "Escribe una contraseña.";
        } else if (campo.value.length < 4 || campo.value.length > 10) {
            mensaje = "La contraseña debe tener entre 4 y 10 caracteres.";
        }
    }

    const errorCampo = document.getElementById("error-" + campo.id);
    if (errorCampo !== null) {
        errorCampo.textContent = mensaje;
    }

    campo.setAttribute("aria-invalid", mensaje !== "" ? "true" : "false");
    return mensaje === "";
}

camposRegistro.forEach(function (campo) {
    campo.addEventListener("input", function () {
        resultadoRegistro.textContent = "";
        validarCampoRegistro(campo);
    });

    campo.addEventListener("blur", function () {
        validarCampoRegistro(campo);
    });
});

formularioRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();
    resultadoRegistro.textContent = "";
    let primerCampoConError = null;

    camposRegistro.forEach(function (campo) {
        if (!validarCampoRegistro(campo) && primerCampoConError === null) {
            primerCampoConError = campo;
        }
    });

    if (primerCampoConError !== null) {
        primerCampoConError.focus();
        return;
    }

    const usuarios = obtenerUsuarios();
    const correoNormalizado = correo.value.trim().toLowerCase();

    const correoRegistrado = usuarios.some(function (usuario) {
        return usuario.correo === correoNormalizado;
    });

    if (correoRegistrado) {
        document.getElementById("error-correo").textContent = "Ya existe una cuenta con ese correo.";
        correo.setAttribute("aria-invalid", "true");
        correo.focus();
        return;
    }

    const nuevoUsuario = {
        run: run.value.trim().toUpperCase(),
        nombre: nombre.value.trim(),
        apellidos: apellidos.value.trim(),
        correo: correoNormalizado,
        fechaNacimiento: fechaNacimiento.value,
        direccion: direccion.value.trim(),
        password: password.value,
        tipoUsuario: "cliente"
    };

    usuarios.push(nuevoUsuario);

    try {
        guardarUsuarios(usuarios);
        localStorage.setItem(claveSesion, JSON.stringify({
            nombre: nuevoUsuario.nombre,
            correo: nuevoUsuario.correo,
            tipoUsuario: nuevoUsuario.tipoUsuario
        }));
        formularioRegistro.reset();
        resultadoRegistro.textContent = "Registro correcto. Tu sesión quedó iniciada.";
    } catch (error) {
        resultadoRegistro.textContent = "No se pudo guardar el registro en este navegador.";
    }
});

document.getElementById("registrar").disabled = false;
