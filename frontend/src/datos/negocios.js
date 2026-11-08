const negocios = [
  {
    id: "NEG001",
    nombre: "TecnoQuibdó",

    propietario: {
      id: 1,
      nombre: "Dueño de TecnoQuibdó",
      correo: "dueno@tecnoquibdo.com",
      password: "123456",
      rol: "Dueño del negocio"
    },

    empleados: [
      {
        id: 2,
        nombre: "Ana Martínez",
        correo: "ana@tecnoquibdo.com",
        password: "123456",
        rol: "Empleado"
      },
      {
        id: 3,
        nombre: "Carlos Pérez",
        correo: "carlos@tecnoquibdo.com",
        password: "123456",
        rol: "Empleado"
      }
    ],

    productos: [
      {
        id: 1,
        nombre: "Laptop Lenovo",
        categoria: "Tecnología",
        descripcion: "Computador portátil para trabajo administrativo.",
        precio: 2500000,
        stock: 24,
        minimo: 5,
        proveedor: "TecnoSoluciones"
      },
      {
        id: 2,
        nombre: "Mouse inalámbrico",
        categoria: "Accesorios",
        descripcion: "Mouse inalámbrico USB.",
        precio: 65000,
        stock: 12,
        minimo: 5,
        proveedor: "CompuMarket"
      },
      {
        id: 3,
        nombre: "Teclado USB",
        categoria: "Accesorios",
        descripcion: "Teclado USB estándar.",
        precio: 80000,
        stock: 18,
        minimo: 6,
        proveedor: "CompuMarket"
      },
      {
        id: 4,
        nombre: "Monitor 24 pulgadas",
        categoria: "Tecnología",
        descripcion: "Monitor LED Full HD.",
        precio: 720000,
        stock: 4,
        minimo: 5,
        proveedor: "TecnoSoluciones"
      }
    ],

    movimientos: [
      {
        id: 1,
        tipo: "Entrada",
        producto: "Laptop Lenovo",
        cantidad: 10,
        fecha: "2026-09-01",
        usuario: "Dueño de TecnoQuibdó"
      },
      {
        id: 2,
        tipo: "Salida",
        producto: "Mouse inalámbrico",
        cantidad: 3,
        fecha: "2026-09-02",
        usuario: "Dueño de TecnoQuibdó"
      },
      {
        id: 3,
        tipo: "Entrada",
        producto: "Teclado USB",
        cantidad: 8,
        fecha: "2026-09-03",
        usuario: "Dueño de TecnoQuibdó"
      }
    ]
  },

  {
    id: "NEG002",
    nombre: "Comercial Pacífico",

    propietario: {
      id: 1,
      nombre: "Dueño de Comercial Pacífico",
      correo: "dueno@comercialpacifico.com",
      password: "123456",
      rol: "Dueño del negocio"
    },

    empleados: [
      {
        id: 2,
        nombre: "Laura Gómez",
        correo: "laura@comercialpacifico.com",
        password: "123456",
        rol: "Empleado"
      }
    ],

    productos: [
      {
        id: 1,
        nombre: "Impresora Epson",
        categoria: "Tecnología",
        descripcion: "Impresora multifuncional para oficina.",
        precio: 950000,
        stock: 7,
        minimo: 2,
        proveedor: "OfiMarket"
      },
      {
        id: 2,
        nombre: "Papel carta",
        categoria: "Oficina",
        descripcion: "Resma de papel tamaño carta.",
        precio: 18000,
        stock: 35,
        minimo: 10,
        proveedor: "Papelería Central"
      }
    ],

    movimientos: [
      {
        id: 1,
        tipo: "Entrada",
        producto: "Papel carta",
        cantidad: 20,
        fecha: "2026-09-05",
        usuario: "Dueño de Comercial Pacífico"
      },
      {
        id: 2,
        tipo: "Salida",
        producto: "Impresora Epson",
        cantidad: 1,
        fecha: "2026-09-06",
        usuario: "Dueño de Comercial Pacífico"
      }
    ]
  }
];

export default negocios;