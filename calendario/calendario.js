const events = {};

// --- Funzione helper per convertire link YouTube in embed ---
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const regExp = /^.*(?:youtu.be\/|v\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[1].length === 11) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url; // fallback se non è YouTube
}

// --- Fetch del CSV e parsing con PapaParse ---
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRSqROrdJEDeejhnLMrFq9tTIvX4XUTRz8719e9xflNmyNAYaQB3h_JfM8E9Mes5AVKgaXGKMIDo-pN/pub?output=csv')
  .then(response => response.text())
  .then(csvText => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        results.data.forEach(row => {
          const date = row.Data?.trim();
          const tipo = row.Tipo?.trim() || '';
          events[date] = { 
            time: row.Orario?.trim(), 
            title: row.Titolo?.trim(), 
            description: row.Descrizione?.trim(), 
            image: row.Immagine?.trim(), 
            linkBiglietti: row.linkBiglietti?.trim(), 
            trailer: row.Trailer?.trim(),
            tipo
          };
        });

        generateJSONLD();
        renderCalendar();
      }
    });
  })
  .catch(error => console.error('Errore nel caricamento del CSV:', error));

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;

const monthNames = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const weekdays = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];

// --- Tooltip ---
const tooltip = document.createElement('div');
tooltip.id = 'calendar-tooltip';
document.body.appendChild(tooltip);

// --- Pop-up modale ---
const modal = document.createElement('div');
modal.id = 'event-modal';
modal.className = 'event-modal';
modal.innerHTML = `
  <div class="event-modal-content">
    <button class="event-modal-close">&times;</button>
    <div id="event-modal-body"></div>
  </div>`;
document.body.appendChild(modal);
const modalBody = modal.querySelector("#event-modal-body");
const modalClose = modal.querySelector(".event-modal-close");

function openEventModal(eventData) {
  modalBody.innerHTML = `
    ${eventData.image ? `<img src="${eventData.image}" alt="${eventData.title}">` : ''}
    <h3>${eventData.title}</h3>
    <p><strong>Orario:</strong> ${eventData.time}</p>
    <p>${(eventData.description || '').replace(/\n/g, '<br>')}</p>
    ${eventData.trailer ? `<div style="margin:15px 0;">
      <iframe width="100%" height="315" src="${getYouTubeEmbedUrl(eventData.trailer)}" 
      title="Trailer ${eventData.title}" frameborder="0" allowfullscreen></iframe>
    </div>` : ''}
    ${eventData.linkBiglietti ? `<a href="${eventData.linkBiglietti}" target="_blank" class="cta-button">Prenota il tuo posto</a>` : ''}
  `;
  modal.classList.add("active");
}

function closeEventModal() { modal.classList.remove("active"); }
modalClose.addEventListener("click", closeEventModal);
modal.addEventListener("click", e => { if(e.target === modal) closeEventModal(); });

// --- Rendering calendario ---
function renderCalendar() {
  const eventBox = document.getElementById('event-box');
  if(eventBox){
    eventBox.innerHTML = '<em>Seleziona un giorno per vedere i dettagli</em>';
    eventBox.style.display = 'none';
  }

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const today = new Date(); today.setHours(0,0,0,0);

  document.getElementById('calendar-title').textContent = `Eventi di ${monthNames[currentMonth]} ${currentYear}`;
  const numDays = lastDay.getDate();

  let calendarHtml = '';

  // Intestazione giorni
  for (let i = 0; i < weekdays.length; i++) {
    calendarHtml += `<div class="day">${weekdays[i].slice(0,3)}</div>`;
  }

  // Giorni vuoti prima del primo del mese
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < firstDayOfWeek; i++) calendarHtml += `<div class="day"></div>`;

  // Giorni del mese
  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    const dateObj = new Date(dateStr);
    let eventClass = '';
    let isPast = false;

    if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && dateObj < today) {
      isPast = true;
      eventClass += ' past-day';
    }

    if (events[dateStr]) {
      switch(events[dateStr].tipo.toUpperCase()) {
        case 'MUSICA': eventClass += ' musica'; break;
        case 'TEATRO': eventClass += ' teatro'; break;
        case 'CINEMA': eventClass += ' cinema'; break;
        case 'JUNIOR': eventClass += ' junior'; break;
        default: eventClass += ' highlighted';
      }
    }

    const clickable = isPast ? '' : `data-date="${dateStr}"`;
    calendarHtml += `<div class="day ${eventClass}" ${clickable}>${day}</div>`;
  }

  const lastDayOfWeek = (firstDay.getDay() + numDays) % 7;
  for (let i = lastDayOfWeek; i < 6; i++) calendarHtml += `<div class="day"></div>`;

  document.getElementById('calendar').innerHTML = calendarHtml;

  // Navigazione mesi
  const eventDates = Object.keys(events).sort();
  const lastEventDateStr = eventDates[eventDates.length - 1];
  const lastEventDate = new Date(lastEventDateStr);

  document.getElementById('prev-month').disabled = currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth <= today.getMonth());
  document.getElementById('next-month').disabled = currentYear > lastEventDate.getFullYear() || (currentYear === lastEventDate.getFullYear() && currentMonth >= lastEventDate.getMonth());
}

// --- Click sui giorni calendario ---
document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');

  calendarEl.addEventListener('click', function(e) {
    if (e.target.classList.contains('day') && e.target.dataset.date) {
      if (selectedDate) {
        const old = document.querySelector(`[data-date="${selectedDate}"]`);
        if (old) old.classList.remove('selected');
      }
      e.target.classList.add('selected');
      selectedDate = e.target.dataset.date;
      showEventPreview(selectedDate);
    }
  });

  // --- Tooltip hover su desktop ---
  calendarEl.addEventListener('mousemove', e => {
    const dayEl = e.target.closest('.day');
    if(dayEl && dayEl.dataset.date && events[dayEl.dataset.date]){
      tooltip.style.display = 'block';
      tooltip.style.opacity = '1';
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top = e.pageY + 10 + 'px';
      tooltip.textContent = events[dayEl.dataset.date].title;
    } else {
      tooltip.style.opacity = '0';
      tooltip.style.display = 'none';
    }
  });

  calendarEl.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    tooltip.style.display = 'none';
  });
});

// --- Mostra preview nell'event box ---
function showEventPreview(dateStr) {
  const event = events[dateStr];
  const eventBox = document.getElementById('event-box');
  if (!eventBox) return;

  if (event) {
    const previewText = (event.description || '').split(' ').slice(0,15).join(' ') + '…';
    eventBox.innerHTML = `
      <p><strong>${event.title}</strong><br>${previewText}</p>
      <button class="cta-button" id="open-event-btn">Scopri di più</button>
    `;
    eventBox.style.display = 'flex';

    document.getElementById('open-event-btn').addEventListener('click', () => {
      openEventModal(event);
    });
  } else {
    eventBox.innerHTML = 'Non ci sono eventi questo giorno.';
    eventBox.style.display = 'flex';
  }
}

// --- Genera JSON-LD ---
function generateJSONLD() {
  const eventsArray = Object.keys(events).map(dateStr => {
    const e = events[dateStr];
    return {
      "@type": "Event",
      "name": e.title,
      "startDate": `${dateStr}T${e.time || "20:30"}`,
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "Place",
        "name": "Auditorium Comunale di Piovene Rocchette",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "P.za degli Alpini, 1",
          "addressLocality": "Piovene Rocchette",
          "postalCode": "36013",
          "addressRegion": "VI",
          "addressCountry": "IT"
        }
      },
      "image": e.image || "https://pioveneauditorium.it/img/logo2.png",
      "description": e.description,
      "offers": {
        "@type": "Offer",
        "url": e.linkBiglietti || "https://pioveneauditorium.it/calendario.html",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
      },
      "performer": {
        "@type": "PerformingGroup",
        "name": "Piovene Auditorium"
      }
    };
  });

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(eventsArray, null, 2);
  document.head.appendChild(script);
}

// --- Navigazione mesi ---
document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
});
document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar();
});
