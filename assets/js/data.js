const STORAGE_KEYS = {
  USERS: "proyecto_users",
  PERFILES: "proyecto_perfiles",
  MODULOS: "proyecto_modulos",
  PERMISOS: "proyecto_permisos",
  SESSION: "proyecto_session"
};

function seedInitialData() {
  const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
  const existingPerfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFILES));
  const existingModulos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MODULOS));
  const existingPermisos = JSON.parse(localStorage.getItem(STORAGE_KEYS.PERMISOS));

  if (!existingPerfiles) {
    const perfiles = [
      { id: 1, nombre: "Administrador", administrador: true },
      { id: 2, nombre: "Editor", administrador: false },
      { id: 3, nombre: "Consulta", administrador: false }
    ];
    localStorage.setItem(STORAGE_KEYS.PERFILES, JSON.stringify(perfiles));
  }

  if (!existingModulos) {
    const modulos = [
      { id: 1, nombre: "Dashboard", clave: "DASHBOARD", ruta: "./dashboard.html", tipo: "ESTATICO" },
      { id: 2, nombre: "Perfiles", clave: "PERFILES", ruta: "./perfiles.html", tipo: "CRUD" },
      { id: 3, nombre: "Módulos", clave: "MODULOS", ruta: "./modulos.html", tipo: "CRUD" },
      { id: 4, nombre: "Usuarios", clave: "USUARIOS", ruta: "./usuarios.html", tipo: "CRUD" },
      { id: 5, nombre: "Permisos Perfil", clave: "PERMISOS_PERFIL", ruta: "./permisos.html", tipo: "CRUD" }
    ];
    localStorage.setItem(STORAGE_KEYS.MODULOS, JSON.stringify(modulos));
  }

  if (!existingPermisos) {
    const permisos = [
      { id: 1, perfil: "Administrador", modulo: "Dashboard", agregar: true, editar: true, consulta: true, eliminar: true, detalle: true },
      { id: 2, perfil: "Administrador", modulo: "Perfiles", agregar: true, editar: true, consulta: true, eliminar: true, detalle: true },
      { id: 3, perfil: "Administrador", modulo: "Módulos", agregar: true, editar: true, consulta: true, eliminar: true, detalle: true },
      { id: 4, perfil: "Administrador", modulo: "Usuarios", agregar: true, editar: true, consulta: true, eliminar: true, detalle: true },
      { id: 5, perfil: "Administrador", modulo: "Permisos Perfil", agregar: true, editar: true, consulta: true, eliminar: true, detalle: true },

      { id: 6, perfil: "Editor", modulo: "Dashboard", agregar: false, editar: false, consulta: true, eliminar: false, detalle: true },
      { id: 7, perfil: "Editor", modulo: "Perfiles", agregar: false, editar: true, consulta: true, eliminar: false, detalle: true },
      { id: 8, perfil: "Editor", modulo: "Módulos", agregar: false, editar: false, consulta: true, eliminar: false, detalle: true },
      { id: 9, perfil: "Editor", modulo: "Usuarios", agregar: false, editar: true, consulta: true, eliminar: false, detalle: true },

      { id: 10, perfil: "Consulta", modulo: "Dashboard", agregar: false, editar: false, consulta: true, eliminar: false, detalle: true },
      { id: 11, perfil: "Consulta", modulo: "Perfiles", agregar: false, editar: false, consulta: true, eliminar: false, detalle: true },
      { id: 12, perfil: "Consulta", modulo: "Módulos", agregar: false, editar: false, consulta: true, eliminar: false, detalle: true },
      { id: 13, perfil: "Consulta", modulo: "Usuarios", agregar: false, editar: false, consulta: true, eliminar: false, detalle: true }
    ];
    localStorage.setItem(STORAGE_KEYS.PERMISOS, JSON.stringify(permisos));
  }

  if (!existingUsers) {
    const users = [
      {
        id: 1,
        nombre: "Administrador General",
        correo: "admin@demo.com",
        password: "123456",
        perfil: "Administrador",
        estado: "Activo"
      },
      {
        id: 2,
        nombre: "Usuario Editor",
        correo: "editor@demo.com",
        password: "123456",
        perfil: "Editor",
        estado: "Activo"
      },
      {
        id: 3,
        nombre: "Usuario Consulta",
        correo: "consulta@demo.com",
        password: "123456",
        perfil: "Consulta",
        estado: "Activo"
      }
    ];

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

seedInitialData();