
/* =========================================================
   app.js
   Interacciones incluidas:
   - Menú móvil accesible.
   - Validación del formulario del boletín.
   - Mensajes de estado para la persona usuaria.

   Este archivo NO envía ni almacena información.
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  inicializarMenuMovil();
  inicializarFormularioBoletin();
});

/* =========================================================
   1. MENÚ MÓVIL
   ========================================================= */

function inicializarMenuMovil() {
  const botonMenu = document.querySelector(".menu-toggle");
  const navegacion = document.querySelector("#navegacion-principal");

  // Evita errores si faltan elementos en el HTML.
  if (!botonMenu || !navegacion) return;

  const breakpointEscritorio = window.matchMedia("(min-width: 600px)");
  const textoAccesible = botonMenu.querySelector(".sr-only");

  function cambiarEstadoMenu(abrir) {
    navegacion.classList.toggle("is-open", abrir);

    botonMenu.setAttribute("aria-expanded", String(abrir));

    if (textoAccesible) {
      textoAccesible.textContent = abrir
        ? "Cerrar menú de navegación"
        : "Abrir menú de navegación";
    }
  }

  // Abre o cierra el menú al pulsar el botón.
  botonMenu.addEventListener("click", () => {
    const menuAbierto =
      botonMenu.getAttribute("aria-expanded") === "true";

    cambiarEstadoMenu(!menuAbierto);
  });

  // Cierra el menú al seleccionar un enlace en móvil.
  navegacion.addEventListener("click", (evento) => {
    const enlace = evento.target.closest("a");

    if (enlace && !breakpointEscritorio.matches) {
      cambiarEstadoMenu(false);
    }
  });

  // Escape cierra el menú y devuelve el foco al botón.
  document.addEventListener("keydown", (evento) => {
    const menuAbierto =
      botonMenu.getAttribute("aria-expanded") === "true";

    if (evento.key === "Escape" && menuAbierto) {
      cambiarEstadoMenu(false);
      botonMenu.focus();
    }
  });

  // Restablece el menú al cambiar a escritorio.
  breakpointEscritorio.addEventListener("change", (evento) => {
    if (evento.matches) {
      cambiarEstadoMenu(false);
    }
  });

  // Estado inicial.
  cambiarEstadoMenu(false);
}

/* =========================================================
   2. FORMULARIO DEL BOLETÍN
   ========================================================= */

function inicializarFormularioBoletin() {
  const formulario = document.querySelector("#formulario-boletin");
  const campoCorreo = document.querySelector("#correo-boletin");
  const mensajeEstado = document.querySelector("#estado-boletin");

  // Comprueba que existan todos los elementos.
  if (!formulario || !campoCorreo || !mensajeEstado) return;

  // Desactiva la validación automática para controlar los mensajes.
  formulario.noValidate = true;

  function mostrarMensaje(texto, tipo = "") {
    mensajeEstado.textContent = texto;

    if (tipo) {
      mensajeEstado.dataset.state = tipo;
    } else {
      delete mensajeEstado.dataset.state;
    }
  }

  // Limpia los mensajes cuando el usuario modifica el correo.
  campoCorreo.addEventListener("input", () => {
    campoCorreo.setCustomValidity("");
    mostrarMensaje("");
  });

  // Validación al intentar enviar el formulario.
  formulario.addEventListener("submit", (evento) => {

    // Evita el envío real del formulario.
    evento.preventDefault();

    // Limpia errores personalizados anteriores.
    campoCorreo.setCustomValidity("");

    const correo = campoCorreo.value.trim();

    campoCorreo.value = correo;

    // Comprueba que el correo no esté vacío.
    if (correo === "") {
      campoCorreo.setCustomValidity(
        "Introduce tu correo electrónico."
      );

    // Comprueba que tenga un formato válido.
    } else if (campoCorreo.validity.typeMismatch) {
      campoCorreo.setCustomValidity(
        "Introduce un correo válido, por ejemplo nombre@dominio.com."
      );
    }

    // Si hay errores, informa y detiene el proceso.
    if (!formulario.checkValidity()) {

      mostrarMensaje(
        "No se pudo continuar. Revisa el campo indicado e introduce un correo electrónico válido.",
        "error"
      );

      // Muestra el error y enfoca el campo que debe corregirse.
      formulario.reportValidity();

      return;
    }

    /*
     * El correo es válido, pero no se envía ni se almacena.
     * Para completar una suscripción real se necesita conectar
     * un servicio de boletín.
     */

    mostrarMensaje(
      "El correo tiene un formato válido. La suscripción no se ha enviado: todavía falta conectar el servicio del boletín.",
      "success"
    );
  });

  // Limpia los mensajes cuando se restablece el formulario.
  formulario.addEventListener("reset", () => {
    campoCorreo.setCustomValidity("");
    mostrarMensaje("");
  });
}
