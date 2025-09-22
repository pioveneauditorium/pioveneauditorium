const events = {};

fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRSqROrdJEDeejhnLMrFq9tTIvX4XUTRz8719e9xflNmyNAYaQB3h_JfM8E9Mes5AVKgaXGKMIDo-pN/pub?output=csv')
  .then(response => response.text())
  .then(data => {
    const rows = data.trim().split('\n');
    // Supponendo che la prima riga sia l’header: Data,Orario,Titolo,Descrizione
    rows.forEach((row, index) => {
      if (index === 0) return; // salta l’header
      const columns = row.split(',');
      // protezione se la descrizione contiene virgole interne?
      // se serve, si può migliorare il parsing (csv robusto).
      if (columns.length >= 4) {
        const date = columns[0].trim();
        const time = columns[1].trim();
        const title = columns[2].trim();
        // unite il resto come descrizione se ci sono virgole extra
        const description = columns.slice(3).join(',').trim();
        events[date] = {
          time: time,
          title: title,
          description: description
        };
      }
    });
    renderCalendar();
  })
  .catch(error => console.error('Errore nel caricamento del CSV:', error));

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;

const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const weekdays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

function renderCalendar() {
  const eventBox = document.getElementById('event-box');

  // inizializza
  eventBox.innerHTML = '<em>Seleziona un giorno per vedere i dettagli</em>';
  eventBox.style.display = 'none';

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const monthName = monthNames[currentMonth];
  document.getElementById('calendar-title').textContent = `Eventi di ${monthName} ${currentYear}`;
  const numDays = lastDay.getDate();

  let calendarHtml = '';

  // intestazione giorni della settimana
  for (let i = 0; i < weekdays.length; i++) {
    calendarHtml += `<div class="day">${weekdays[i].slice(0, 3)}</div>`;
  }

  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarHtml += `<div class="day"></div>`;
  }

  for (let day = 1; day <= numDays; day++) {
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const hasEvent = events[dateStr] ? 'highlighted' : '';

    calendarHtml += `<div class="day ${hasEvent}" data-date="${dateStr}">${day}</div>`;
  }

  const lastDayOfWeek = (firstDay.getDay() + numDays) % 7;
  for (let i = lastDayOfWeek; i < 6; i++) {
    calendarHtml += `<div class="day"></div>`;
  }

  document.getElementById('calendar').innerHTML = calendarHtml;

  // gestione pulsanti mese precedente/successivo
  const prevButton = document.getElementById('prev-month');
  const nextButton = document.getElementById('next-month');
  const today = new Date();
  prevButton.disabled = currentYear === today.getFullYear() && currentMonth <= today.getMonth();
  nextButton.disabled = currentYear === today.getFullYear() && currentMonth === 11;
}

function showEvent(eventDate) {
  const event = events[eventDate];
  const eventBox = document.getElementById('event-box');

  if (event) {
    eventBox.innerHTML = `
      <strong>Orario:</strong> Ore ${event.time}<br>
      <strong>Titolo:</strong> ${event.title}<br>
      <strong>Descrizione:</strong><br>${event.description}
    `;
  } else {
    eventBox.innerHTML = 'Non ci sono eventi questo giorno';
  }
  eventBox.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  // click sui giorni
  document.getElementById('calendar').addEventListener('click', function (e) {
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

  // prev / next
  document.getElementById('prev-month').addEventListener('click', function () {
    if (currentMonth > 0) {
      currentMonth--;
      renderCalendar();
    }
  });
  document.getElementById('next-month').addEventListener('click', function () {
    if (currentMonth < 11) {
      currentMonth++;
      renderCalendar();
    }
  });
});
