/* =========================================================
   app.js
   - Catálogo generado desde datos (destacados y catálogo).
   - Búsqueda con sugerencias, filtros, orden y contador.
   - Carrito en memoria (se pierde al recargar la página).
   - Menú móvil accesible y validación del boletín.

   Este archivo NO envía ni almacena información del usuario.
   Los productos son datos de ejemplo.
   ========================================================= */

"use strict";

/* ---------------------------------------------------------
   0. DATOS Y ESTADO
   --------------------------------------------------------- */

const PRODUCTOS = [
  { id: "soporte-monitor", nombre: "Soporte para monitor ajustable", categoria: "escritorio", color: "negro", precio: 189000, destacado: true, icono: "🖥️", descripcion: "Eleva tu pantalla a la altura de los ojos y libera espacio." },
  { id: "organizador-cables", nombre: "Organizador de cables", categoria: "escritorio", color: "blanco", precio: 45000, destacado: false, icono: "🧵", descripcion: "Mantén cargadores y cables ordenados bajo el escritorio." },
  { id: "alfombrilla", nombre: "Alfombrilla extendida", categoria: "escritorio", color: "gris", precio: 89000, destacado: false, icono: "⬜", descripcion: "Superficie amplia con borde cosido y base antideslizante." },
  { id: "lampara", nombre: "Lámpara LED regulable", categoria: "escritorio", color: "blanco", precio: 165000, destacado: true, icono: "💡", descripcion: "Luz cálida o fría con control de intensidad." },
  { id: "cojin-lumbar", nombre: "Cojín lumbar ergonómico", categoria: "ergonomia", color: "negro", precio: 129000, destacado: true, icono: "🪑", descripcion: "Apoyo lumbar de espuma viscoelástica para sillas de oficina." },
  { id: "reposapies", nombre: "Reposapiés ajustable", categoria: "ergonomia", color: "gris", precio: 75000, destacado: false, icono: "🦶", descripcion: "Inclinación regulable para mantener las piernas relajadas." },
  { id: "raton-vertical", nombre: "Ratón ergonómico vertical", categoria: "ergonomia", color: "negro", precio: 149000, destacado: false, icono: "🖱️", descripcion: "Postura de la mano más natural durante largas jornadas." },
  { id: "base-portatil", nombre: "Base para portátil de aluminio", categoria: "ergonomia", color: "gris", precio: 118000, destacado: true, icono: "💻", descripcion: "Eleva la pantalla y mejora la postura del cuello." },
  { id: "teclado", nombre: "Teclado compacto inalámbrico", categoria: "tecnologia", color: "blanco", precio: 260000, destacado: true, icono: "⌨️", descripcion: "Diseño bajo perfil con conexión Bluetooth y receptor USB." },
  { id: "hub-usb", nombre: "Hub USB-C de 6 puertos", categoria: "tecnologia", color: "gris", precio: 210000, destacado: false, icono: "🔌", descripcion: "HDMI, USB-A y lector de tarjetas en un solo accesorio." },
];

const CATEGORIAS = { escritorio: "Escritorio", ergonomia: "Ergonomía", tecnologia: "Tecnología" };
const COLORES = { negro: "Negro", blanco: "Blanco", gris: "Gris" };
const PRECIO_MAXIMO_INICIAL = 500000;
const MAX_UNIDADES_POR_PRODUCTO = 99;

const ESTADO = {
  categoria: "todos",
  color: "todos",
  precioMax: PRECIO_MAXIMO_INICIAL,
  orden: "destacados",
  busqueda: "",
};

// Carrito: id del producto -> cantidad.
const carrito = new Map();

const $ = (selector) => document.querySelector(selector);

/* ---------------------------------------------------------
   Utilidades
   --------------------------------------------------------- */

function formatearPrecio(valor) {
  return "$" + valor.toLocaleString("es-CO");
}

// Quita tildes y pasa a minúsculas para comparar textos de búsqueda.
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buscarProducto(id) {
  return PRODUCTOS.find((producto) => producto.id === id);
}

/* ---------------------------------------------------------
   1. INICIO
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  $("#anio-actual").textContent = new Date().getFullYear();

  inicializarMenuMovil();
  inicializarBusqueda();
  inicializarFiltros();
  inicializarCategorias();
  inicializarCarrito();
  inicializarBoletin();

  renderDestacados();
  renderCatalogo();
});

/* ---------------------------------------------------------
   2. MENÚ MÓVIL
   --------------------------------------------------------- */

function inicializarMenuMovil() {
  const boton = $(".menu-toggle");
  const navegacion = $("#navegacion-principal");
  const textoAccesible = boton.querySelector(".sr-only");
  const escritorio = window.matchMedia("(min-width: 900px)");

  function cambiarEstado(abrir) {
    navegacion.classList.toggle("is-open", abrir);
    boton.setAttribute("aria-expanded", String(abrir));
    textoAccesible.textContent = abrir
      ? "Cerrar menú de navegación"
      : "Abrir menú de navegación";
  }

  boton.addEventListener("click", () => {
    cambiarEstado(boton.getAttribute("aria-expanded") !== "true");
  });

  // En móvil, al elegir un enlace el menú se cierra.
  navegacion.addEventListener("click", (evento) => {
    if (evento.target.closest("a") && !escritorio.matches) {
      cambiarEstado(false);
    }
  });

  // Escape cierra el menú y devuelve el foco al botón.
  document.addEventListener("keydown", (evento) => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    if (evento.key === "Escape" && abierto && !escritorio.matches) {
      cambiarEstado(false);
      boton.focus();
    }
  });

  escritorio.addEventListener("change", () => cambiarEstado(false));

  cambiarEstado(false);
}

/* ---------------------------------------------------------
   3. TARJETAS Y CATÁLOGO
   --------------------------------------------------------- */

function crearTarjeta(producto) {
  const articulo = document.createElement("article");
  articulo.className = "product-card";

  const media = document.createElement("div");
  media.className = "product-media";
  media.setAttribute("aria-hidden", "true");
  media.textContent = producto.icono;

  const cuerpo = document.createElement("div");
  cuerpo.className = "product-body";

  const categoria = document.createElement("span");
  categoria.className = "product-category";
  categoria.textContent = `${CATEGORIAS[producto.categoria]} · ${COLORES[producto.color]}`;

  const titulo = document.createElement("h3");
  titulo.textContent = producto.nombre;

  const descripcion = document.createElement("p");
  descripcion.className = "product-desc";
  descripcion.textContent = producto.descripcion;

  const precio = document.createElement("p");
  precio.className = "product-price";
  precio.textContent = formatearPrecio(producto.precio);

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn btn-primary btn-add";
  boton.textContent = "Añadir al carrito";
  boton.setAttribute("aria-label", `Añadir ${producto.nombre} al carrito`);
  boton.addEventListener("click", () => agregarAlCarrito(producto.id, boton));

  cuerpo.append(categoria, titulo, descripcion, precio, boton);
  articulo.append(media, cuerpo);
  return articulo;
}

function renderLista(contenedor, productos) {
  contenedor.replaceChildren(...productos.map(crearTarjeta));
}

function renderDestacados() {
  renderLista(
    $("#productos-destacados"),
    PRODUCTOS.filter((producto) => producto.destacado)
  );
}

function obtenerFiltrados() {
  const termino = normalizar(ESTADO.busqueda);

  const filtrados = PRODUCTOS.filter((producto) => {
    const coincideCategoria =
      ESTADO.categoria === "todos" || producto.categoria === ESTADO.categoria;
    const coincideColor =
      ESTADO.color === "todos" || producto.color === ESTADO.color;
    const coincidePrecio = producto.precio <= ESTADO.precioMax;
    const coincideBusqueda =
      termino === "" ||
      normalizar(
        `${producto.nombre} ${producto.descripcion} ${CATEGORIAS[producto.categoria]}`
      ).includes(termino);

    return coincideCategoria && coincideColor && coincidePrecio && coincideBusqueda;
  });

  const ordenes = {
    destacados: (a, b) => Number(b.destacado) - Number(a.destacado),
    "precio-asc": (a, b) => a.precio - b.precio,
    "precio-desc": (a, b) => b.precio - a.precio,
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
  };

  return filtrados.sort(ordenes[ESTADO.orden]);
}

function renderCatalogo() {
  const productos = obtenerFiltrados();
  const total = productos.length;

  renderLista($("#productos-catalogo"), productos);

  $("#cantidad-productos").textContent =
    total === 1 ? "1 producto encontrado" : `${total} productos encontrados`;
  $("#sin-resultados").hidden = total > 0;
}

/* ---------------------------------------------------------
   4. BÚSQUEDA CON SUGERENCIAS
   --------------------------------------------------------- */

function inicializarBusqueda() {
  const formulario = $("#formulario-busqueda");
  const campo = $("#buscador");
  const lista = $("#sugerencias-busqueda");

  function cerrarSugerencias() {
    lista.hidden = true;
    lista.replaceChildren();
    campo.setAttribute("aria-expanded", "false");
  }

  function mostrarSugerencias() {
    const termino = normalizar(campo.value);
    const coincidencias = termino
      ? PRODUCTOS.filter((producto) =>
          normalizar(producto.nombre).includes(termino)
        ).slice(0, 5)
      : [];

    if (coincidencias.length === 0) {
      cerrarSugerencias();
      return;
    }

    lista.replaceChildren(
      ...coincidencias.map((producto) => {
        const elemento = document.createElement("li");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "suggestion-item";
        boton.textContent = producto.nombre;
        boton.addEventListener("click", () => {
          campo.value = producto.nombre;
          aplicarBusqueda(producto.nombre);
        });
        elemento.append(boton);
        return elemento;
      })
    );

    lista.hidden = false;
    campo.setAttribute("aria-expanded", "true");
  }

  function aplicarBusqueda(texto) {
    ESTADO.busqueda = texto.trim();
    cerrarSugerencias();
    renderCatalogo();
  }

  campo.addEventListener("input", () => {
    // Al borrar el texto se restablece el catálogo.
    if (campo.value.trim() === "") {
      aplicarBusqueda("");
      return;
    }
    mostrarSugerencias();
  });

  campo.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarSugerencias();
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    aplicarBusqueda(campo.value);
    $("#productos").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Cierra las sugerencias al salir del buscador.
  formulario.addEventListener("focusout", (evento) => {
    if (!formulario.contains(evento.relatedTarget)) cerrarSugerencias();
  });
}

/* ---------------------------------------------------------
   5. FILTROS Y ORDEN
   --------------------------------------------------------- */

function inicializarFiltros() {
  const selectCategoria = $("#filtro-categoria");
  const rangoPrecio = $("#filtro-precio");
  const salidaPrecio = $("#precio-seleccionado");
  const selectColor = $("#filtro-color");
  const selectOrden = $("#orden-productos");

  function actualizarSalidaPrecio() {
    salidaPrecio.textContent = `Hasta ${formatearPrecio(ESTADO.precioMax)}`;
  }

  selectCategoria.addEventListener("change", () => {
    ESTADO.categoria = selectCategoria.value;
    renderCatalogo();
  });

  rangoPrecio.addEventListener("input", () => {
    ESTADO.precioMax = Number(rangoPrecio.value);
    actualizarSalidaPrecio();
    renderCatalogo();
  });

  selectColor.addEventListener("change", () => {
    ESTADO.color = selectColor.value;
    renderCatalogo();
  });

  selectOrden.addEventListener("change", () => {
    ESTADO.orden = selectOrden.value;
    renderCatalogo();
  });

  $("#limpiar-filtros").addEventListener("click", () => {
    ESTADO.categoria = "todos";
    ESTADO.color = "todos";
    ESTADO.precioMax = PRECIO_MAXIMO_INICIAL;

    selectCategoria.value = "todos";
    selectColor.value = "todos";
    rangoPrecio.value = String(PRECIO_MAXIMO_INICIAL);
    actualizarSalidaPrecio();
    renderCatalogo();
  });

  actualizarSalidaPrecio();
}

// Las tarjetas de categoría de la portada preseleccionan el filtro.
function inicializarCategorias() {
  document.querySelectorAll("[data-category]").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      ESTADO.categoria = enlace.dataset.category;
      $("#filtro-categoria").value = ESTADO.categoria;
      renderCatalogo();
    });
  });
}

/* ---------------------------------------------------------
   6. CARRITO
   --------------------------------------------------------- */

function inicializarCarrito() {
  const panel = $("#cart-panel");
  const fondo = $("#fondo-carrito");
  const botonAbrir = $("#boton-carrito");
  const botonCerrar = panel.querySelector(".cart-close");

  function abrirCarrito() {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    fondo.hidden = false;
    document.body.classList.add("no-scroll");
    botonCerrar.focus();
  }

  function cerrarCarrito() {
    if (!panel.classList.contains("is-open")) return;

    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    fondo.hidden = true;
    document.body.classList.remove("no-scroll");
    botonAbrir.focus();
  }

  botonAbrir.addEventListener("click", abrirCarrito);
  botonCerrar.addEventListener("click", cerrarCarrito);
  fondo.addEventListener("click", cerrarCarrito);

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarCarrito();
  });

  actualizarCarrito();
}

function agregarAlCarrito(id, boton) {
  const actual = carrito.get(id) || 0;
  carrito.set(id, Math.min(actual + 1, MAX_UNIDADES_POR_PRODUCTO));
  actualizarCarrito();

  // Confirmación breve en el propio botón.
  if (boton) {
    const textoOriginal = boton.textContent;
    boton.textContent = "Añadido ✓";
    boton.classList.add("is-added");
    setTimeout(() => {
      boton.textContent = textoOriginal;
      boton.classList.remove("is-added");
    }, 1500);
  }
}

function cambiarCantidad(id, cambio) {
  const nueva = (carrito.get(id) || 0) + cambio;

  if (nueva <= 0) {
    carrito.delete(id);
  } else {
    carrito.set(id, Math.min(nueva, MAX_UNIDADES_POR_PRODUCTO));
  }
  actualizarCarrito();
}

function eliminarDelCarrito(id) {
  carrito.delete(id);
  actualizarCarrito();
}

function crearItemCarrito({ producto, cantidad }) {
  const elemento = document.createElement("li");
  elemento.className = "cart-item";

  const titulo = document.createElement("h3");
  titulo.textContent = producto.nombre;

  const meta = document.createElement("p");
  meta.className = "cart-item-meta";
  meta.textContent = `${formatearPrecio(producto.precio)} c/u`;

  const subtotal = document.createElement("p");
  subtotal.className = "cart-item-subtotal";
  subtotal.textContent = formatearPrecio(producto.precio * cantidad);

  const acciones = document.createElement("div");
  acciones.className = "cart-item-actions";

  const controles = document.createElement("div");
  controles.className = "qty";

  const menos = document.createElement("button");
  menos.type = "button";
  menos.textContent = "−";
  menos.setAttribute("aria-label", `Reducir cantidad de ${producto.nombre}`);
  menos.addEventListener("click", () => cambiarCantidad(producto.id, -1));

  const numero = document.createElement("span");
  numero.textContent = String(cantidad);
  numero.setAttribute("aria-label", `Cantidad: ${cantidad}`);

  const mas = document.createElement("button");
  mas.type = "button";
  mas.textContent = "+";
  mas.setAttribute("aria-label", `Aumentar cantidad de ${producto.nombre}`);
  mas.addEventListener("click", () => cambiarCantidad(producto.id, 1));

  controles.append(menos, numero, mas);

  const eliminar = document.createElement("button");
  eliminar.type = "button";
  eliminar.className = "cart-remove";
  eliminar.textContent = "Eliminar";
  eliminar.setAttribute("aria-label", `Eliminar ${producto.nombre} del carrito`);
  eliminar.addEventListener("click", () => eliminarDelCarrito(producto.id));

  acciones.append(controles, eliminar);
  elemento.append(titulo, meta, subtotal, acciones);
  return elemento;
}

function actualizarCarrito() {
  const lista = $("#lista-carrito");

  const items = [...carrito.entries()]
    .map(([id, cantidad]) => ({ producto: buscarProducto(id), cantidad }))
    .filter((item) => item.producto);

  const unidades = items.reduce((suma, item) => suma + item.cantidad, 0);
  const total = items.reduce(
    (suma, item) => suma + item.producto.precio * item.cantidad,
    0
  );

  $("#contador-carrito").textContent = String(unidades);
  $("#boton-carrito").setAttribute(
    "aria-label",
    `Abrir carrito de compras, ${unidades} ${unidades === 1 ? "producto" : "productos"}`
  );
  $("#total-carrito").textContent = formatearPrecio(total);

  if (items.length === 0) {
    const vacio = document.createElement("li");
    vacio.className = "cart-empty";
    vacio.textContent = "Tu carrito está vacío.";
    lista.replaceChildren(vacio);
    return;
  }

  lista.replaceChildren(...items.map(crearItemCarrito));
}

/* ---------------------------------------------------------
   7. BOLETÍN
   --------------------------------------------------------- */

function inicializarBoletin() {
  const formulario = $("#formulario-boletin");
  const campo = $("#correo-boletin");
  const mensaje = $("#estado-boletin");

  function mostrarMensaje(texto, tipo = "") {
    mensaje.textContent = texto;
    if (tipo) {
      mensaje.dataset.state = tipo;
    } else {
      delete mensaje.dataset.state;
    }
  }

  campo.addEventListener("input", () => {
    campo.setCustomValidity("");
    mostrarMensaje("");
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    campo.setCustomValidity("");

    const correo = campo.value.trim();
    campo.value = correo;

    if (correo === "") {
      campo.setCustomValidity("Introduce tu correo electrónico.");
    } else if (campo.validity.typeMismatch) {
      campo.setCustomValidity(
        "Introduce un correo válido, por ejemplo nombre@dominio.com."
      );
    }

    if (!formulario.checkValidity()) {
      mostrarMensaje(
        "No se pudo continuar. Revisa el campo e introduce un correo electrónico válido.",
        "error"
      );
      formulario.reportValidity();
      return;
    }

    // Aún no hay servicio de boletín conectado: el correo no se envía ni se guarda.
    mostrarMensaje(
      "El correo tiene un formato válido. La suscripción no se ha enviado: todavía falta conectar el servicio del boletín.",
      "success"
    );
  });

  formulario.addEventListener("reset", () => {
    campo.setCustomValidity("");
    mostrarMensaje("");
  });
}