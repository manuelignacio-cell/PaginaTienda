(() => {
    const formulario = document.getElementById("login-admin");
    const correo = document.getElementById("correo");
    const password = document.getElementById("password");
    const resultado = document.getElementById("resultado-login-admin");
    document.getElementById("primer-acceso").hidden = !SesionAdmin.necesitaConfiguracion();
    function validar(campo) {
        let error = "";
        if (campo === correo && (correo.value.length > 100 || !/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo.value.trim()))) error = "Ingresa un correo válido de hasta 100 caracteres: duoc.cl, profesor.duoc.cl o gmail.com.";
        if (campo === password && (!password.value.trim() || password.value.length < 4 || password.value.length > 10)) error = "Ingresa una contraseña de 4 a 10 caracteres.";
        document.getElementById("error-" + campo.id).textContent = error;
        campo.setAttribute("aria-invalid", error ? "true" : "false");
        return !error;
    }
    [correo, password].forEach(campo => ["input", "blur"].forEach(evento => campo.addEventListener(evento, () => { resultado.textContent = ""; validar(campo); })));
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        const invalidos = [correo, password].filter(campo => !validar(campo));
        if (invalidos.length) { invalidos[0].focus(); return; }
        try {
            const usuario = SesionAdmin.ingresar(correo.value, password.value);
            window.location.replace(usuario.tipoUsuario === "administrador" ? "admin.html" : "productos.html");
        } catch (error) { resultado.textContent = error.message; }
    });
    document.getElementById("ingresar-admin").disabled = false;
})();
