document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (!email || !password) {
      alert("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    try {
      // Primero intentar login como administrador
      try {
        const adminResponse = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/Administrador/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, contrasena: password }),
        });

        if (adminResponse.ok) {
          const admin = await adminResponse.json();
          
          // Guardar datos del administrador en sessionStorage
          sessionStorage.setItem("usuarioCompleto", JSON.stringify(admin));
          sessionStorage.setItem("adminId", admin.idAdmin);
          sessionStorage.setItem("adminNombre", admin.nombreCompleto);
          sessionStorage.setItem("adminEmail", admin.email);
          sessionStorage.setItem("esAdministrador", "true");
          sessionStorage.setItem("tipoUsuario", "administrador");
          
          alert(`¡Bienvenido ${admin.nombreCompleto}! Accediendo al panel de administración...`);
          
          // Redirigir al panel de administración
          window.location.href = "../admin/admin.html";
          return;
        }
        // Si adminResponse no es ok, continuamos sin mostrar error
      } catch (adminError) {
        // Error de red o servidor en admin API, continuamos con usuario
        console.log("Intentando login como usuario normal...");
      }

      // Si no es administrador, intentar login como usuario normal
      const userResponse = await fetch("https://gymlomax-backend-api-grarfsd8hme6bjbc.canadacentral-01.azurewebsites.net/api/UsuariosApi/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({}));
        if (userResponse.status === 401) {
          alert(errorData.message || "Credenciales inválidas o usuario inactivo.");
        } else {
          alert(errorData.message || "Ocurrió un error al iniciar sesión.");
        }
        return;
      }

      const usuario = await userResponse.json();
      
      // Verificación por si el backend usa "nombreCompleto" o "nombre"
      const nombre = usuario.nombreCompleto || usuario.nombre || "Usuario";
      
      // Guardar TODOS los datos del usuario en sessionStorage
      sessionStorage.setItem("usuarioCompleto", JSON.stringify(usuario));
      sessionStorage.setItem("usuarioId", usuario.idUsuario);
      sessionStorage.setItem("usuarioNombre", nombre);
      sessionStorage.setItem("usuarioEmail", usuario.email);
      sessionStorage.setItem("usuarioCedula", usuario.cedula || "");
      sessionStorage.setItem("usuarioSexo", usuario.sexo || "");
      sessionStorage.setItem("usuarioCelular", usuario.celular || "");
      sessionStorage.setItem("usuarioFechaNacimiento", usuario.fechaNacimiento || "");
      sessionStorage.setItem("usuarioEstado", usuario.estado || "");
      sessionStorage.setItem("usuarioFechaRegistro", usuario.fechaRegistro || "");
      sessionStorage.setItem("usuarioUltimoLogin", usuario.ultimoLogin || "");
      sessionStorage.setItem("esAdministrador", "false");
      sessionStorage.setItem("tipoUsuario", "usuario");

      alert(`¡Bienvenido ${nombre}!`);
      
      // Redirigir al home normal
      window.location.href = "../home/home.html";

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error de red. Por favor, verifica tu conexión.");
    }
  });
});