(() => {
    if (!SesionAdmin.permite("usuario-form.html") && !SesionAdmin.configurando()) return;
    const formulario = document.getElementById("usuario-form");
    const resultado = document.getElementById("resultado-usuario");
    const boton = document.getElementById("guardar-usuario");
    const nombres = ["run", "nombre", "apellidos", "correo", "fechaNacimiento", "tipoUsuario", "region", "comuna", "direccion", "password"];
    const campos = Object.fromEntries(nombres.map(nombre => [nombre, formulario.elements[nombre]]));
    const parametro = new URLSearchParams(window.location.search).get("correo");
    let original = parametro === null ? null : UsuariosAdmin.normalizarCorreo(parametro);
    function datos() {
        return Object.fromEntries(nombres.map(nombre => [nombre, campos[nombre].value]));
    }
    function avisar(texto, error = true) {
        resultado.textContent = texto;
        resultado.className = "admin-message " + (error ? "admin-message-error" : "admin-message-success");
    }
    function mostrarError(nombre, mensaje) {
        document.getElementById("error-" + nombre).textContent = mensaje || "";
        campos[nombre].setAttribute("aria-invalid", mensaje ? "true" : "false");
    }
    function comunas() {
        campos.comuna.replaceChildren(new Option("Selecciona una comuna", ""));
        const region = RegionesAdmin.find(r => r.region === campos.region.value);
        campos.comuna.disabled = !region;
        if (region) region.comunas.forEach(comuna => campos.comuna.add(new Option(comuna, comuna)));
    }
    function modoEdicion() {
        document.getElementById("titulo-usuario").textContent = "Editar usuario";
        document.title = "ColliClothes - Editar usuario";
        document.getElementById("ayuda-password").textContent = "Deja la contraseña vacía para conservar la actual. Para cambiarla, usa entre 4 y 10 caracteres.";
        campos.password.required = false;
        boton.textContent = "Guardar cambios";
    }
    function errores() {
        const encontrados = UsuariosAdmin.validar(datos(), UsuariosAdmin.leer(), original);
        if (campos.fechaNacimiento.validity.badInput) encontrados.fechaNacimiento = "Completa una fecha válida o deja el campo vacío.";
        return encontrados;
    }
    RegionesAdmin.forEach(region => campos.region.add(new Option(region.region, region.region)));
    campos.region.addEventListener("change", () => {
        comunas();
        mostrarError("comuna", "Selecciona una comuna de la región indicada.");
    });
    try {
        const usuarios = UsuariosAdmin.leer();
        comunas();
        if (original !== null) {
            const usuario = usuarios.find(u => UsuariosAdmin.normalizarCorreo(u.correo) === original);
            if (!usuario) throw new Error("El usuario no existe. Vuelve al listado.");
            nombres.filter(n => n !== "password" && n !== "comuna").forEach(n => { campos[n].value = usuario[n] ?? ""; });
            comunas();
            campos.comuna.value = usuario.comuna || "";
            modoEdicion();
            if (!usuario.region || !usuario.comuna) avisar("Completa región y comuna antes de guardar los cambios.", false);
        }
        boton.disabled = false;
        if (SesionAdmin.configurando()) {
            original = null;
            document.getElementById("titulo-usuario").textContent = "Configurar el primer administrador";
            campos.tipoUsuario.value = "administrador";
            campos.tipoUsuario.disabled = true;
            const volver = formulario.querySelector(".cancel-button");
            volver.href = "login.html";
            volver.textContent = "Volver al acceso";
        }
    } catch (error) {
        avisar(error.message);
        return;
    }
    nombres.forEach(nombre => {
        ["input", "blur", "change"].forEach(evento => campos[nombre].addEventListener(evento, () => {
            resultado.textContent = "";
            try { mostrarError(nombre, errores()[nombre]); }
            catch (error) { avisar(error.message); }
        }));
    });
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        try {
            const encontrados = errores();
            nombres.forEach(nombre => mostrarError(nombre, encontrados[nombre]));
            const primero = nombres.find(nombre => encontrados[nombre]);
            if (primero) {
                avisar("Revisa los campos indicados antes de guardar.");
                campos[primero].focus();
                return;
            }
            const guardado = UsuariosAdmin.guardar(datos(), original);
            if (!SesionAdmin.permite("usuario-form.html")) { window.location.replace("login.html"); return; }
            if (Object.keys(guardado.errores).length) {
                nombres.forEach(nombre => mostrarError(nombre, guardado.errores[nombre]));
                avisar("Los datos cambiaron. Revisa los campos indicados.");
                return;
            }
            original = guardado.usuario.correo;
            campos.password.value = "";
            modoEdicion();
            window.history.replaceState(null, "", "usuario-form.html?correo=" + encodeURIComponent(original));
            avisar("Usuario guardado. Puedes volver al listado o continuar editándolo.", false);
            resultado.focus();
        } catch (error) {
            avisar("No se pudo completar el guardado. " + error.message);
        }
    });
})();
