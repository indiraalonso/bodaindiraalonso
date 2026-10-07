/* ============== Reveal on scroll ============== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: .15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Mark hero as loaded for parallax */
window.addEventListener('load', () => {
  document.querySelector('.hero').classList.add('loaded');
});

/* Parallax suave sobre el video del hero */
const heroVideo = document.querySelector('.hero__video');
if (heroVideo) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if(y < window.innerHeight){
      heroVideo.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
    }
  }, { passive: true });
}

/* ============== Nuestra Canción ============== */
const songBtn = document.getElementById('songBtn');
const songAudio = document.getElementById('songAudio');
if (songBtn && songAudio) {
  const label = songBtn.querySelector('.song-btn__label');
  songBtn.addEventListener('click', async () => {
    if (songAudio.paused) {
      try {
        await songAudio.play();
        songBtn.classList.add('playing');
        songBtn.setAttribute('aria-pressed', 'true');
        if (label) label.textContent = 'Pausar canción';
      } catch (err) {
        console.error('No se pudo reproducir la canción:', err);
      }
    } else {
      songAudio.pause();
      songBtn.classList.remove('playing');
      songBtn.setAttribute('aria-pressed', 'false');
      if (label) label.textContent = 'Nuestra Canción';
    }
  });
}

/* ============== CONFIGURACIÓN ==============
   Pega aquí la URL de tu Web App de Apps Script (termina en /exec). */
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwV47IsmbkqE10g3-5rOMQkEZvicDs8cegi6GZequVCtElZdq2avWbWGNEcVvFWpBnB5w/exec';

/* Evento: 28 de noviembre de 2026, 5:30 pm (hora de Costa Rica, UTC-6) */
const EVENT_DATE = new Date('2026-11-28T17:30:00-06:00');
/* Fecha límite para confirmar: 14 de noviembre de 2026, 11:59 pm (Costa Rica) */
const RSVP_DEADLINE = new Date('2026-11-02T23:59:59-06:00');

/* Pintar la fecha de la caja.

   El día admite dos formas y se elige con este interruptor:
     · false → «24»           (por defecto: siempre cabe, a cualquier ancho)
     · true  → «Veinticuatro» (el diseño original; el cuerpo se ajusta solo)

   Con palabra hacía falta apretar el cuerpo para que la hora no se saliera
   de la pantalla. Ahora el CSS deja encoger la columna (min-width: 0), así
   que la medida del ajuste es real y las dos formas funcionan. */
const DIA_EN_LETRAS = false;

(function pintarFecha() {
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DIAS_LETRA = ['','Uno','Dos','Tres','Cuatro','Cinco','Seis','Siete','Ocho','Nueve','Diez','Once','Doce','Trece','Catorce','Quince','Dieciséis','Diecisiete','Dieciocho','Diecinueve','Veinte','Veintiuno','Veintidós','Veintitrés','Veinticuatro','Veinticinco','Veintiséis','Veintisiete','Veintiocho','Veintinueve','Treinta','Treinta y uno'];
  const numEl = document.getElementById('ex-day');
  const mesEl = document.getElementById('ex-month');
  if (mesEl) mesEl.textContent = 'Noviembre';
  if (!numEl) return;

  const dia = 28;
  numEl.textContent = DIA_EN_LETRAS ? DIAS_LETRA[dia] : String(dia);

  if (!DIA_EN_LETRAS) return;   // un número siempre cabe: no hay nada que ajustar

  /* Ajuste del cuerpo para las palabras largas.

     El fallo de antes estaba aquí: se medía `col.clientWidth`, pero la
     columna ya venía estirada POR la propia palabra, así que el hueco
     disponible salía mayor que la palabra y el bucle no entraba nunca.
     Ahora se mide contra la mitad útil de la caja, que es el sitio que la
     columna tiene derecho a ocupar, y no contra lo que acabó ocupando. */
  const ajustar = function () {
    const col = numEl.parentElement;
    const caja = col.parentElement;
    numEl.style.fontSize = '';

    const estCol = getComputedStyle(col);
    const relleno = parseFloat(estCol.paddingLeft) + parseFloat(estCol.paddingRight);
    const disponible = caja.clientWidth / 2 - relleno - 2;
    if (disponible <= 0) return;

    let fs = parseFloat(getComputedStyle(numEl).fontSize);
    let guarda = 0;
    while (numEl.scrollWidth > disponible && fs > 22 && guarda < 120) {
      fs -= 1;
      numEl.style.fontSize = fs + 'px';
      guarda++;
    }
  };

  ajustar();
  window.addEventListener('resize', ajustar);
  window.addEventListener('load', ajustar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustar);
})();

/* ============== Countdown ============== */
const targetDate = EVENT_DATE.getTime();
const dEl = document.querySelector('[data-days]');
const hEl = document.querySelector('[data-hours]');
const mEl = document.querySelector('[data-mins]');
const sEl = document.querySelector('[data-secs]');

function pad(n){ return String(n).padStart(2,'0'); }

function tick(){
  const now = Date.now();
  let diff = Math.max(0, targetDate - now);

  const days = Math.floor(diff / (1000*60*60*24));
  diff -= days * (1000*60*60*24);
  const hours = Math.floor(diff / (1000*60*60));
  diff -= hours * (1000*60*60);
  const mins = Math.floor(diff / (1000*60));
  diff -= mins * (1000*60);
  const secs = Math.floor(diff / 1000);

  dEl.textContent = pad(days);
  hEl.textContent = pad(hours);
  mEl.textContent = pad(mins);
  sEl.textContent = pad(secs);
}
tick();
setInterval(tick, 1000);

/* ============== Lista de invitados (espacios reservados) ==============
   Al escribir su nombre, se busca en esta lista (sin importar tildes,
   mayúsculas o espacios de más) y se muestra cuántos espacios tiene
   confirmados. Actualiza esta lista si cambian los invitados. */
const GUEST_LIST = [
  { nombre: "Priscilla Chinchilla", espacios: 2 },
  { nombre: "Nuria Solano", espacios: 5 },
  { nombre: "Vanessa Fernandez", espacios: 1 },
  { nombre: "Lilliana Fonseca", espacios: 2 },
  { nombre: "Cesar Chacon", espacios: 2 },
  { nombre: "Ricardo Murillo", espacios: 3 },
  { nombre: "Jose Antonio Blanco", espacios: 2 },
  { nombre: "Jorge Campos", espacios: 2 },
  { nombre: "Melissa Kaine", espacios: 1 },
  { nombre: "Martha Chacon", espacios: 1 },
  { nombre: "Alonso Vargas", espacios: 4 }
];

function _normalizarNombre(s) {
  return String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const GUEST_MAP = {};
GUEST_LIST.forEach(function(g) { GUEST_MAP[_normalizarNombre(g.nombre)] = g.espacios; });

/* ============== RSVP Form ============== */
(function() {
  var _form = document.getElementById('formulario-rsvp');
  if (!_form) return;

  var _i = 1; // espacios reservados; se ajusta al reconocer el nombre
  var _rt = document.getElementById('rsvp-invitation-text');
  var _rc = document.getElementById('reservados-count');
  var _nombreInput = document.getElementById('campo-1');

  // ── Botones de opción (set del input oculto + estado activo) ──
  _form.querySelectorAll('.choice-buttons').forEach(function(group) {
    group.addEventListener('click', function(e) {
      var b = e.target.closest('.choice-btn');
      if (!b) return;
      group.querySelectorAll('.choice-btn').forEach(function(x) { x.classList.remove('active'); });
      b.classList.add('active');
      var hidden = group.parentElement.querySelector('input[type="hidden"]');
      if (hidden) { hidden.value = b.dataset.value; hidden.dispatchEvent(new Event('change')); }
    });
  });

  // ── Cantidad de espacios (botones 1..i, según asistencia) ──
  var _cantWrap = _form.querySelector('[data-role="cantidad"]');
  var _cantChoice = _cantWrap ? _cantWrap.querySelector('.choice-buttons') : null;
  var _cantHidden = _cantWrap ? _cantWrap.querySelector('input[type="hidden"]') : null;
  var _target = _cantWrap ? _cantWrap.dataset.target : null;
  var _affirm = _cantWrap ? _cantWrap.dataset.affirm : null;
  var _targetEl = _target ? document.getElementById(_target) : null;

  var _rebuildCantButtons = function() {
    if (!_cantChoice) return;
    _cantChoice.innerHTML = '';
    for (var n = 1; n <= _i; n++) {
      var bb = document.createElement('button');
      bb.type = 'button'; bb.className = 'choice-btn';
      bb.dataset.value = String(n); bb.textContent = String(n);
      _cantChoice.appendChild(bb);
    }
  };

  var _updateCant = function() {
    var show = _i > 1 && (!_targetEl || _targetEl.value === _affirm);
    if (_cantWrap) _cantWrap.style.display = show ? 'block' : 'none';
    if (_cantHidden) {
      if (show) {
        // Limpiar selección previa para que el invitado deba elegir
        _cantHidden.value = '';
        if (_cantChoice) _cantChoice.querySelectorAll('.choice-btn').forEach(function(x) { x.classList.remove('active'); });
      } else {
        _cantHidden.value = (_targetEl && _targetEl.value && _targetEl.value !== _affirm) ? '' : '1';
      }
    }
  };

  if (_targetEl) { _targetEl.addEventListener('change', _updateCant); }
  _rebuildCantButtons();
  _updateCant();

  // ── Reconocer al invitado por el nombre escrito ──
  var _aplicarEspacios = function(espacios) {
    _i = espacios;
    if (_rt) _rt.style.display = 'block';
    if (_rc) _rc.textContent = _i + (_i === 1 ? ' espacio' : ' espacios');
    _rebuildCantButtons();
    _updateCant();
  };

  var _limpiarEspacios = function() {
    _i = 1;
    if (_rt) _rt.style.display = 'none';
    _rebuildCantButtons();
    _updateCant();
  };

  var _buscarInvitado = function() {
    if (!_nombreInput) return;
    var clave = _normalizarNombre(_nombreInput.value);
    var espacios = clave ? GUEST_MAP[clave] : undefined;
    if (espacios) { _aplicarEspacios(espacios); } else { _limpiarEspacios(); }
  };

  if (_nombreInput) {
    var _debounceId;
    _nombreInput.addEventListener('input', function() {
      clearTimeout(_debounceId);
      _debounceId = setTimeout(_buscarInvitado, 350);
    });
    _nombreInput.addEventListener('blur', _buscarInvitado);
  }

  // ── Fecha límite ──
  var _deadline = RSVP_DEADLINE;
  var _dlDate = document.getElementById('rsvp-deadline-date');
  if (_dlDate) {
    _dlDate.textContent = _deadline.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', timeZone: 'America/Costa_Rica' });
  }
  if (new Date() > _deadline) {
    if (_form) _form.style.display = 'none';
    var _dm = document.getElementById('mensaje-plazo-finalizado');
    if (_dm) _dm.style.display = 'block';
  }

  // ── Envío a Google Sheets (Apps Script) ──
  var _btnEnviar = document.getElementById('btn-enviar');
  var _err = document.getElementById('form-error');
  var _ok = document.getElementById('mensaje-exito');

  var _mostrarError = function(msg) {
    if (!_err) return;
    _err.textContent = msg;
    _err.classList.add('show');
  };

  var _enviar = async function(e) {
    if (e) e.preventDefault();
    if (_err) _err.classList.remove('show');

    var nombre = document.getElementById('campo-1').value.trim();
    var asistencia = document.getElementById('campo-2').value;
    var cantidad = document.getElementById('campo-3').value;

    if (!nombre) return _mostrarError('Escribe tu nombre completo.');
    if (!asistencia) return _mostrarError('Indica si asistirás o no.');
    if (asistencia === 'Asistiré' && !cantidad) return _mostrarError('Elige la cantidad de personas.');
    if (new Date() > RSVP_DEADLINE) return _mostrarError('El plazo para confirmar ha finalizado.');
    if (APPS_SCRIPT_URL.indexOf('PEGA_AQUI') === 0) return _mostrarError('Falta configurar la URL del servidor.');

    var payload = {
      nombre: nombre,
      asistencia: asistencia,
      cantidad: asistencia === 'Asistiré' ? Number(cantidad) : 0,
      reservados: _i
    };

    _btnEnviar.disabled = true;
    var textoOriginal = _btnEnviar.textContent;
    _btnEnviar.textContent = 'Enviando…';

    try {
      // text/plain evita el preflight CORS que Apps Script no soporta
      var res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Error desconocido');

      _form.style.display = 'none';
      if (_ok) _ok.style.display = 'block';
    } catch (err) {
      console.error('No se pudo enviar la confirmación:', err);
      _mostrarError('No pudimos guardar tu confirmación. Revisa tu conexión e inténtalo de nuevo.');
      _btnEnviar.disabled = false;
      _btnEnviar.textContent = textoOriginal;
    }
  };

  _form.addEventListener('submit', _enviar);
  if (_btnEnviar) _btnEnviar.addEventListener('click', _enviar);
})();

/* Floating hearts effect */
function createHeart() {
  const namesContainer = document.querySelector('.hero__names');
  if (!namesContainer) return;

  const heart = document.createElement('span');
  heart.className = 'floating-heart';
  heart.innerHTML = '<i class="fa-solid fa-heart"></i>';

  // Alterna entre dorado suave y blanco cálido para dar variedad tonal
  const heartColors = ['#c8a878', '#f5f1ea'];
  heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];

  const randomX = Math.random() * 80 - 40;
  const randomScale = 0.5 + Math.random() * 0.8;
  const randomDuration = 7 + Math.random() * 4;
  const randomRotation = (Math.random() * 60 - 30) + 'deg';

  heart.style.left = `calc(50% + ${randomX}%)`;
  heart.style.transform = `translateX(-50%) scale(${randomScale}) rotate(${randomRotation})`;
  heart.style.animationDuration = `${randomDuration}s`;

  namesContainer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, randomDuration * 1000);
}

createHeart();
setInterval(createHeart, 2200);

/* ============== Agregar al calendario (.ics) ============== */
const calBtn = document.getElementById('addToCalendar');
if (calBtn) {
  calBtn.addEventListener('click', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Boda Vargas Martinez//ES',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:boda-vargas-martinez-20261128@invitacion',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      'DTSTART;TZID=America/Costa_Rica:20261128T173000',
      'DTEND;TZID=America/Costa_Rica:20261128T223000',
      'SUMMARY:Boda Vargas & Martínez',
      'DESCRIPTION:¡Nos casamos! Te esperamos para celebrar juntos este día tan especial.',
      'LOCATION:Le Chandelier',
      'URL:https://maps.app.goo.gl/JWbxA9NiSz4f7FmV8',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Boda-Vargas-Martinez.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}


