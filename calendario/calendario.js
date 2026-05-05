const events = {};

// Fetch CSV
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

          if (!events[date]) {
            events[date] = [];
          }

          events[date].push({
            time: row.Orario?.trim(),
            title: row.Titolo?.trim(),
            description: row.Descrizione?.trim(),
            image: row.Immagine?.trim(),
            linkBiglietti: row.linkBiglietti?.trim(),
            trailer: row.Trailer?.trim(),
            tipo
          });
        });

        generateJSONLD();
        renderCalendar();
      }
    });
  })
  .catch(error => console.error('Errore CSV:', error));

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;

const monthNames = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const weekdays = ['Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica'];

function renderCalendar() {
  const eventBox = document.getElementById('event-box');
  eventBox.innerHTML = '<em>Seleziona un giorno</em>';
  eventBox.style.display = 'none';

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const today = new Date();
  today.setHours(0,0,0,0);

  document.getElementById('calendar-title').textContent = `Eventi di ${monthNames[currentMonth]} ${currentYear}`;

  let html = '';

  // Header giorni
  weekdays.forEach(d => {
    html += `<div class="day">${d.slice(0,3)}</div>`;
  });

  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  for (let i = 0; i < firstDayOfWeek; i++) {
    html += `<div class="day"></div>`;
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${currentYear}-${(currentMonth+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
    const dateObj = new Date(dateStr);

    let isPast = dateObj < today;
    let classes = 'day';
    let style = '';

    if (isPast) classes += ' past-day';

    if (events[dateStr]) {
      const tipoColori = {
        'CINEMA': '#FFD300',
        'TEATRO': 'purple',
        'MUSICA': 'orange',
        'JUNIOR': '#4CAF50',
        'DEFAULT': 'lightgray'
      };

      const tipi = events[dateStr].map(e => e.tipo.toUpperCase());
      const unici = [...new Set(tipi)];
      const colori = unici.map(t => tipoColori[t] || tipoColori['DEFAULT']);

      if (colori.length === 1) {
        style = `background:${colori[0]}`;
      } else {
        const step = 100 / colori.length;
        const gradient = colori.map((c,i)=>{
          return `${c} ${i*step}% ${(i+1)*step}%`;
        }).join(',');

        style = `background:linear-gradient(to right, ${gradient})`;
      }
    }

    const clickable = isPast ? '' : `data-date="${dateStr}"`;

    html += `<div class="${classes}" style="${style}" ${clickable}>${day}</div>`;
  }

  document.getElementById('calendar').innerHTML = html;
}

function showEvent(date) {
  const dayEvents = events[date];
  const box = document.getElementById('event-box');

  if (!dayEvents) {
    box.innerHTML = 'Nessun evento';
    box.style.display = 'flex';
    return;
  }

  let html = '';

  dayEvents.forEach(ev => {
    html += `
      <div class="event-main">
        <div class="event-left">
          ${ev.image ? `<img src="${ev.image}">` : ''}
        </div>
        <div class="event-right">
          <h3>${ev.title}</h3>
          <p><strong>${date}</strong> • ${ev.time}</p>
          <p>${(ev.description||'').replace(/\n/g,'<br>')}</p>
          ${ev.linkBiglietti ? `<a href="${ev.linkBiglietti}" target="_blank" class="cta-button">Prenota</a>` : ''}
        </div>
      </div>
    `;
  });

  box.innerHTML = html;
  box.style.display = 'flex';
}

function generateJSONLD() {
  const arr = [];

  Object.keys(events).forEach(d => {
    events[d].forEach(e => {
      arr.push({
        "@type": "Event",
        "name": e.title,
        "startDate": `${d}T${e.time||"20:30"}`
      });
    });
  });

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(arr);
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', () => {
  const cal = document.getElementById('calendar');

  cal.addEventListener('click', e => {
    if (e.target.dataset.date) {
      document.querySelectorAll('.day').forEach(d=>d.classList.remove('selected'));
      e.target.classList.add('selected');
      showEvent(e.target.dataset.date);
    }
  });

  document.getElementById('prev-month').onclick = () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth=11; currentYear--; }
    renderCalendar();
  };

  document.getElementById('next-month').onclick = () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth=0; currentYear++; }
    renderCalendar();
  };
});