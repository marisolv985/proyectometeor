const STORAGE_KEYS = {
  USERS: "proyecto_users",
  PERFILES: "proyecto_perfiles",
  MODULOS: "proyecto_modulos",
  SESSION: "proyecto_session"
};

function seedInitialData() {
  const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
  const existingPerfiles = JSON.parse(localStorage.getItem(STORAGE_KEYS.PERFILES));
  const existingModulos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MODULOS));

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
      { id: 1, nombre: "Perfiles", clave: "PERFILES", ruta: "./perfiles.html", tipo: "CRUD" },
      { id: 2, nombre: "Módulos", clave: "MODULOS", ruta: "./modulos.html", tipo: "CRUD" },
      { id: 3, nombre: "Usuarios", clave: "USUARIOS", ruta: "./usuarios.html", tipo: "CRUD" },
      { id: 4, nombre: "Dashboard", clave: "DASHBOARD", ruta: "./dashboard.html", tipo: "ESTATICO" }
    ];
    localStorage.setItem(STORAGE_KEYS.MODULOS, JSON.stringify(modulos));
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