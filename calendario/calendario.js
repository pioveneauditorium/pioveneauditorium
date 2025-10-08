const events = {};

// Fetch del CSV e parsing con PapaParse
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
            tipo
          };
        });

        // Dopo aver caricato gli eventi, crea JSON-LD dinamico
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

function renderCalendar() {
  const eventBox = document.getElementById('event-box');
  eventBox.innerHTML = '<em>Seleziona un giorno per vedere i dettagli</em>';
  eventBox.style.display = 'none';

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  document.getElementById('calendar-title').textContent = `Eventi di ${monthNames[currentMonth]} ${currentYear}`;
  const numDays = lastDay.getDate();

  let calendarHtml = '';

  // Intestazione giorni
  for (let i = 0; i < weekdays.length; i++) {
    calendarHtml += `<div class="day">${weekdays[i].slice(0,3)}</div>`;
  }

  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarHtml += `<div class="day"></div>`;
  }

  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    let eventClass = '';

    if (events[dateStr]) {
      switch(events[dateStr].tipo.toUpperCase()) {
        case 'MUSICA': eventClass = 'musica'; break;
        case 'TEATRO': eventClass = 'teatro'; break;
        case 'CINEMA': eventClass = 'cinema'; break;
        default: eventClass = 'highlighted';
      }
    }

    calendarHtml += `<div class="day ${eventClass}" data-date="${dateStr}">${day}</div>`;
  }

  const lastDayOfWeek = (firstDay.getDay() + numDays) % 7;
  for (let i = lastDayOfWeek; i < 6; i++) {
    calendarHtml += `<div class="day"></div>`;
  }

  document.getElementById('calendar').innerHTML = calendarHtml;

  // Trova l'ultima data degli eventi
  const eventDates = Object.keys(events).sort();
  const lastEventDateStr = eventDates[eventDates.length - 1];
  const lastEventDate = new Date(lastEventDateStr);

  // Pulsanti mese precedente/successivo
  const prevButton = document.getElementById('prev-month');
  const nextButton = document.getElementById('next-month');
  const today = new Date();

  prevButton.disabled = currentYear < today.getFullYear() || 
                        (currentYear === today.getFullYear() && currentMonth <= today.getMonth());

  nextButton.disabled = currentYear > lastEventDate.getFullYear() ||
                        (currentYear === lastEventDate.getFullYear() && currentMonth >= lastEventDate.getMonth());
}

function showEvent(eventDate) {
  const event = events[eventDate];
  const eventBox = document.getElementById('event-box');

  if (event) {
    let textHtml = `
      <div class="event-text">
        <strong>Orario:</strong> Ore ${event.time}<br>
        <strong>Titolo:</strong> ${event.title}<br>
        <strong>Descrizione:</strong><br>${(event.description || '').replace(/\n/g, '<br>')}<br>
    `;

    if (event.linkBiglietti) {
      textHtml += `
        <div style="margin-top:15px;">
          <a href="${event.linkBiglietti}" target="_blank" class="cta-button">Prenota il tuo posto</a>
        </div>
      `;
    }

    textHtml += `</div>`;

    let imageHtml = '';
    if (event.image) {
      imageHtml = `<img src="${event.image}" alt="${event.title}">`;
    }

    eventBox.innerHTML = textHtml + imageHtml;
  } else {
    eventBox.innerHTML = 'Non ci sono eventi questo giorno.';
  }

  eventBox.style.display = 'flex';
}

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
      showEvent(selectedDate);
    }
  });

  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });
});
