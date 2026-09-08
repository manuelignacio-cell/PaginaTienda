(() => {
    if (!SesionAdmin.permite("usuarios.html")) return;
    const tabla = document.getElementById("lista-usuarios");
    const resultado = document.getElementById("resultado-usuarios");
    function avisar(mensaje, error = false) {
        resultado.textContent = mensaje;
        resultado.className = "admin-message " + (error ? "admin-message-error" : "admin-message-success");
    }
    function mostrar() {
        try {
            const usuarios = UsuariosAdmin.leer();
            tabla.replaceChildren();
            document.getElementById("usuarios-vacios").hidden = usuarios.length > 0;
            usuarios.forEach(usuario => {
                const correo = UsuariosAdmin.normalizarCorreo(usuario.correo);
                const fila = document.createElement("tr");
                [usuario.run, usuario.nombre + " " + usuario.apellidos, usuario.correo,
                    UsuariosAdmin.roles[usuario.tipoUsuario] || "Perfil por revisar", usuario.comuna || "Sin completar"].forEach(valor => {
                    const celda = document.createElement("td");
                    celda.textContent = valor;
                    fila.appendChild(celda);
                });
                const acciones = document.createElement("td");
                const grupo = document.createElement("div");
                grupo.className = "table-actions";
                const editar = document.createElement("a");
                editar.href = "usuario-form.html?correo=" + encodeURIComponent(correo);
                editar.className = "edit-button";
                editar.textContent = "Editar";
                editar.setAttribute("aria-label", "Editar a " + usuario.nombre);
                const eliminar = document.createElement("button");
                eliminar.type = "button";
                eliminar.className = "delete-button";
                eliminar.textContent = "Eliminar";
                eliminar.setAttribute("aria-label", "Eliminar a " + usuario.nombre);
                eliminar.addEventListener("click", () => {
                    if (!window.confirm("¿Eliminar la cuenta de " + usuario.nombre + " (" + correo + ")?")) return;
                    try {
                        UsuariosAdmin.eliminar(correo);
                        if (!SesionAdmin.permite("usuarios.html")) { window.location.replace("login.html"); return; }
                        mostrar();
                        avisar("Usuario eliminado.");
                        resultado.focus();
                    } catch (error) {
                        avisar("No se pudo eliminar. " + error.message, true);
                    }
                });
                grupo.append(editar, eliminar);
                acciones.appendChild(grupo);
                fila.appendChild(acciones);
                tabla.appendChild(fila);
            });
        } catch (error) {
            avisar("No se pudo cargar el listado. " + error.message, true);
        }
    }
    mostrar();
})();
