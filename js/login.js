const formularioLogin = document.getElementById("formulario-login");
const correoLogin = document.getElementById("correo-login");
const passwordLogin = document.getElementById("password-login");
const resultadoLogin = document.getElementById("resultado-login");
const camposLogin = [correoLogin, passwordLogin];
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

function correoValido(valor) {
    return /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(valor);
}

function validarCampoLogin(campo) {
    const valor = campo.value.trim();
    let mensaje = "";

    if (campo === correoLogin) {
        if (valor === "") {
            mensaje = "Escribe tu correo.";
        } else if (campo.value.length > 100) {
            mensaje = "El correo no puede superar los 100 caracteres.";
        } else if (!correoValido(valor)) {
            mensaje = "El correo debe usar un dominio permitido.";
        }
    }

    if (campo === passwordLogin) {
        if (valor === "") {
            mensaje = "Escribe tu contraseña.";
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

camposLogin.forEach(function (campo) {
    campo.addEventListener("input", function () {
        resultadoLogin.textContent = "";
        validarCampoLogin(campo);
    });

    campo.addEventListener("blur", function () {
        validarCampoLogin(campo);
    });
});

formularioLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();
    resultadoLogin.textContent = "";
    let primerCampoConError = null;

    camposLogin.forEach(function (campo) {
        if (!validarCampoLogin(campo) && primerCampoConError === null) {
            primerCampoConError = campo;
        }
    });

    if (primerCampoConError !== null) {
        primerCampoConError.focus();
        return;
    }

    const correoNormalizado = correoLogin.value.trim().toLowerCase();
    const usuarios = obtenerUsuarios();

    const usuarioEncontrado = usuarios.find(function (usuario) {
        return usuario.correo === correoNormalizado && usuario.password === passwordLogin.value;
    });

    if (usuarioEncontrado === undefined) {
        resultadoLogin.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    localStorage.setItem(claveSesion, JSON.stringify({
        nombre: usuarioEncontrado.nombre,
        correo: usuarioEncontrado.correo,
        tipoUsuario: usuarioEncontrado.tipoUsuario
    }));

    formularioLogin.reset();
    resultadoLogin.textContent = "Inicio de sesión correcto. Bienvenido a ColliClothes.";
});

document.getElementById("ingresar").disabled = false;
