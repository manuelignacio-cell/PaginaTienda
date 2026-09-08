// Comparte cuentas y nombres de campos con js/registro.js y js/login.js.
const UsuariosAdmin = (() => {
    const clave = "colliclothes-usuarios";
    const roles = { administrador: "Administrador", cliente: "Cliente", vendedor: "Vendedor" };
    const normalizarCorreo = correo => correo.trim().toLowerCase();

    function runValido(run) {
        if (!/^\d{6,8}[0-9K]$/.test(run)) return false;
        const cuerpo = run.slice(0, -1);
        if (Number(cuerpo) === 0) return false;
        let suma = 0;
        let factor = 2;
        for (let i = cuerpo.length - 1; i >= 0; i--) {
            suma += Number(cuerpo[i]) * factor;
            factor = factor === 7 ? 2 : factor + 1;
        }
        const resto = 11 - suma % 11;
        const digito = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
        return run.at(-1) === digito;
    }

    function leer() {
        const texto = localStorage.getItem(clave);
        if (texto === null) return [];
        const usuarios = JSON.parse(texto);
        // Aceptar cuentas anteriores sin región/comuna; se completan al editarlas.
        if (!Array.isArray(usuarios) || usuarios.some(u => !u ||
            !["run", "nombre", "apellidos", "correo", "direccion", "password", "tipoUsuario"].every(c => typeof u[c] === "string"))) {
            throw new Error("No se pueden leer las cuentas guardadas. No se modificaron los datos.");
        }
        const correos = usuarios.map(u => normalizarCorreo(u.correo));
        if (new Set(correos).size !== correos.length) throw new Error("Hay correos duplicados en las cuentas guardadas. Revisa los datos antes de continuar.");
        return usuarios;
    }

    function validar(datos, usuarios = [], original = null) {
        const errores = {};
        const run = datos.run.trim().toUpperCase();
        const correo = normalizarCorreo(datos.correo);
        if (!runValido(run)) errores.run = "Ingresa un RUN válido de 7 a 9 caracteres, sin puntos ni guion, con su dígito verificador.";
        for (const [campo, maximo] of [["nombre", 50], ["apellidos", 100], ["direccion", 300]]) {
            if (!datos[campo].trim()) errores[campo] = "Este campo es obligatorio.";
            else if (datos[campo].length > maximo) errores[campo] = "Admite hasta " + maximo + " caracteres.";
        }
        if (datos.correo.length > 100 || !/^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/.test(correo)) {
            errores.correo = "Ingresa un correo de hasta 100 caracteres con dominio duoc.cl, profesor.duoc.cl o gmail.com.";
        }
        const otros = usuarios.filter(u => normalizarCorreo(u.correo) !== original);
        if (otros.some(u => normalizarCorreo(u.correo) === correo)) errores.correo = "Ya existe una cuenta con este correo.";
        if (otros.some(u => u.run.trim().toUpperCase() === run)) errores.run = "Ya existe una cuenta con este RUN.";
        if (!Object.hasOwn(roles, datos.tipoUsuario)) errores.tipoUsuario = "Selecciona un tipo de usuario.";
        const region = RegionesAdmin.find(r => r.region === datos.region);
        if (!region) errores.region = "Selecciona una región.";
        if (!region || !region.comunas.includes(datos.comuna)) errores.comuna = "Selecciona una comuna de la región indicada.";
        if (datos.fechaNacimiento) {
            const fecha = new Date(datos.fechaNacimiento + "T00:00:00Z");
            if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaNacimiento) || Number.isNaN(fecha.getTime()) ||
                fecha.toISOString().slice(0, 10) !== datos.fechaNacimiento) errores.fechaNacimiento = "Ingresa una fecha válida o deja este campo vacío.";
        }
        // La contraseña permite usar estas cuentas en el login existente.
        if (original === null || datos.password !== "") {
            if (!datos.password.trim() || datos.password.length < 4 || datos.password.length > 10) {
                errores.password = "La contraseña debe tener entre 4 y 10 caracteres.";
            }
        }
        return errores;
    }

    function guardar(datos, original = null) {
        if (typeof SesionAdmin !== "undefined") {
            if (SesionAdmin.configurando()) {
                if (original !== null || datos.tipoUsuario !== "administrador") throw new Error("El primer acceso solo permite crear una cuenta administradora.");
            } else SesionAdmin.exigirAdministrador();
        }
        const usuarios = leer();
        const errores = validar(datos, usuarios, original);
        if (Object.keys(errores).length) return { errores };
        const indice = original === null ? -1 : usuarios.findIndex(u => normalizarCorreo(u.correo) === original);
        if (original !== null && indice < 0) throw new Error("El usuario ya no existe. Vuelve al listado.");
        const anterior = indice < 0 ? {} : usuarios[indice];
        if (anterior.tipoUsuario === "administrador" && datos.tipoUsuario !== "administrador" &&
            usuarios.filter(u => u.tipoUsuario === "administrador").length === 1) {
            return { errores: { tipoUsuario: "Crea otro administrador antes de cambiar el perfil del último administrador." } };
        }
        const usuario = { ...anterior, ...datos, run: datos.run.trim().toUpperCase(), nombre: datos.nombre.trim(),
            apellidos: datos.apellidos.trim(), correo: normalizarCorreo(datos.correo), direccion: datos.direccion.trim(),
            password: datos.password === "" ? anterior.password : datos.password };
        if (indice < 0) usuarios.push(usuario);
        else usuarios[indice] = usuario;
        localStorage.setItem(clave, JSON.stringify(usuarios));
        if (original !== null && (usuario.correo !== anterior.correo || usuario.password !== anterior.password || usuario.tipoUsuario !== anterior.tipoUsuario)) {
            invalidarSesion(original);
        }
        return { usuario, errores: {} };
    }

    function eliminar(correo) {
        if (typeof SesionAdmin !== "undefined") SesionAdmin.exigirAdministrador();
        const usuarios = leer();
        if (usuarios.find(u => normalizarCorreo(u.correo) === correo)?.tipoUsuario === "administrador" &&
            usuarios.filter(u => u.tipoUsuario === "administrador").length === 1) throw new Error("No puedes eliminar al último administrador.");
        if (!usuarios.some(u => normalizarCorreo(u.correo) === correo)) throw new Error("El usuario ya no existe. Actualiza el listado.");
        localStorage.setItem(clave, JSON.stringify(usuarios.filter(u => normalizarCorreo(u.correo) !== correo)));
        invalidarSesion(correo);
    }

    function invalidarSesion(correo) {
        const sesion = JSON.parse(localStorage.getItem("colliclothes-sesion") || "null");
        if (sesion && typeof sesion.correo === "string" && normalizarCorreo(sesion.correo) === correo) localStorage.removeItem("colliclothes-sesion");
    }

    return { leer, validar, guardar, eliminar, runValido, roles, normalizarCorreo };
})();
