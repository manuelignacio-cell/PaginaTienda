// Simulación de permisos para la entrega frontend; localStorage no reemplaza un servidor.
const SesionAdmin = (() => {
    const clave = "colliclothes-sesion";
    const permisos = {
        "admin.html": ["administrador"],
        "productos.html": ["administrador", "vendedor"],
        "producto-detalle.html": ["administrador", "vendedor"],
        "producto-form.html": ["administrador"],
        "usuarios.html": ["administrador"],
        "usuario-form.html": ["administrador"]
    };
    function actual() {
        try {
            const sesion = JSON.parse(localStorage.getItem(clave));
            const usuarios = JSON.parse(localStorage.getItem("colliclothes-usuarios"));
            if (!sesion || typeof sesion.correo !== "string" || !Array.isArray(usuarios)) return null;
            const coincidencias = usuarios.filter(u => u && typeof u.correo === "string" && u.correo.toLowerCase() === sesion.correo.toLowerCase());
            if (coincidencias.length !== 1) return null;
            const usuario = coincidencias[0];
            if (!["administrador", "vendedor", "cliente"].includes(usuario.tipoUsuario)) return null;
            // El perfil vigente se obtiene de la cuenta, no de una copia antigua en la sesión.
            return { nombre: usuario.nombre, correo: usuario.correo, tipoUsuario: usuario.tipoUsuario };
        } catch { return null; }
    }
    function permite(pagina, usuario = actual()) {
        return !!usuario && (permisos[pagina] || []).includes(usuario.tipoUsuario);
    }
    function necesitaConfiguracion() {
        try {
            const usuarios = JSON.parse(localStorage.getItem("colliclothes-usuarios") || "[]");
            return Array.isArray(usuarios) && usuarios.every(u => u && typeof u.correo === "string" && typeof u.tipoUsuario === "string") &&
                !usuarios.some(u => u.tipoUsuario === "administrador");
        } catch { return false; }
    }
    function configurando() {
        return typeof window !== "undefined" && window.location.pathname.endsWith("/usuario-form.html") &&
            new URLSearchParams(window.location.search).get("inicial") === "1" &&
            !new URLSearchParams(window.location.search).has("correo") && necesitaConfiguracion();
    }
    function exigirAdministrador() {
        if (actual()?.tipoUsuario !== "administrador") throw new Error("Necesitas una sesión de administrador para realizar esta acción.");
    }
    function cerrar() {
        localStorage.removeItem(clave);
    }
    function ingresar(correo, password) {
        const usuarios = JSON.parse(localStorage.getItem("colliclothes-usuarios") || "[]");
        if (!Array.isArray(usuarios)) throw new Error("No se pueden leer las cuentas guardadas.");
        const encontrados = usuarios.filter(u => u && typeof u.correo === "string" && u.correo.toLowerCase() === correo.trim().toLowerCase() && u.password === password);
        if (encontrados.length !== 1) throw new Error("Correo o contraseña incorrectos.");
        const usuario = encontrados[0];
        if (!["administrador", "vendedor"].includes(usuario.tipoUsuario)) throw new Error("Esta cuenta solo tiene acceso a la tienda.");
        localStorage.setItem(clave, JSON.stringify({ nombre: usuario.nombre, correo: usuario.correo, tipoUsuario: usuario.tipoUsuario }));
        return usuario;
    }
    return { actual, permite, exigirAdministrador, cerrar, ingresar, necesitaConfiguracion, configurando };
})();

if (typeof document !== "undefined") {
    (() => {
        const pagina = window.location.pathname.split("/").pop();
        if (pagina === "login.html") return;
        function comprobar() {
            if (SesionAdmin.configurando()) {
                document.querySelectorAll('.menu a:not([href="../index.html"]), .logout').forEach(e => { e.hidden = true; });
                document.documentElement.classList.add("admin-autorizado");
                return true;
            }
            const usuario = SesionAdmin.actual();
            if (!SesionAdmin.permite(pagina, usuario)) {
                document.documentElement.classList.remove("admin-autorizado");
                window.location.replace(!usuario ? "login.html" : usuario.tipoUsuario === "vendedor" ? "productos.html" : "../index.html");
                return false;
            }
            document.querySelectorAll('.menu a[href="admin.html"], .menu a[href="usuarios.html"], [data-solo-admin]').forEach(elemento => {
                elemento.hidden = usuario.tipoUsuario !== "administrador";
            });
            document.querySelectorAll(".admin-user strong").forEach(elemento => { elemento.textContent = usuario.nombre; });
            document.querySelectorAll(".admin-user small").forEach(elemento => { elemento.textContent = usuario.tipoUsuario === "administrador" ? "Administrador" : "Vendedor"; });
            document.documentElement.classList.add("admin-autorizado");
            return true;
        }
        comprobar();
        window.addEventListener("pageshow", comprobar);
        window.addEventListener("focus", comprobar);
        window.addEventListener("storage", evento => {
            if (evento.key === null || ["colliclothes-sesion", "colliclothes-usuarios"].includes(evento.key)) window.location.reload();
        });
        document.addEventListener("click", evento => {
            if (!evento.target.closest(".logout")) return;
            evento.preventDefault();
            try { SesionAdmin.cerrar(); window.location.replace("login.html"); }
            catch { window.alert("No se pudo cerrar la sesión. Revisa los permisos de almacenamiento del navegador."); }
        });
    })();
}
