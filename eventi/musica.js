document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventi-musica");
  if (!container) return;

  // Funzione per troncare il testo a un certo numero di parole
  function truncateText(text, wordLimit = 25) {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '…';
  }

  // Funzione per formattare la data in "giorno mese anno"
  function formatDate(dateString) {
    const months = [
      "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
      "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
    ];
    const parts = dateString.split('-'); // ["YYYY", "MM", "DD"]
    if(parts.length !== 3) return dateString;
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1];
    const day = parseInt(parts[2], 10);
    return `${day} ${month} ${year}`;
  }

  // Crea popup evento
  const modal = document.createElement("div");
  modal.id = "event-modal";
  modal.className = "event-modal";
  modal.innerHTML = `
    <div class="event-modal-content">
      <button class="event-modal-close">&times;</button>
      <div id="event-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalBody = modal.querySelector("#event-modal-body");
  const modalClose = modal.querySelector(".event-modal-close");

  function openEventModal(eventData) {
    modalBody.innerHTML = `
      ${eventData.immagine ? `<img src="${eventData.immagine}" alt="${eventData.titolo}">` : ''}
      <h3>${eventData.titolo}</h3>
      <p><strong>Data:</strong> ${formatDate(eventData.dataEvento)} <strong>Orario:</strong> ${eventData.orario}</p>
      <p>${eventData.descrizione}</p>
      ${eventData.linkBiglietti ? `<a href="${eventData.linkBiglietti}" target="_blank" class="cta-button">Prenota il tuo posto</a>` : ''}
    `;
    modal.classList.add("active");
  }

  function closeEventModal() {
    modal.classList.remove("active");
  }

  modalClose.addEventListener("click", closeEventModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeEventModal(); });

  // Carica CSV degli eventi
  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRSqROrdJEDeejhnLMrFq9tTIvX4XUTRz8719e9xflNmyNAYaQB3h_JfM8E9Mes5AVKgaXGKMIDo-pN/pub?output=csv')
    .then(res => res.text())
    .then(data => {
      const rows = data.trim().split('\n').slice(1); // Salta header
      rows.forEach(row => {
        if (!row.trim()) return;
        const columns = row.split(',').map(c => c.trim());
        if (columns.length < 7) return;

        const [dataEvento, orario, titolo, descrizione, immagine, linkBiglietti, tipo] = columns;
        if (tipo.toUpperCase() !== "MUSICA") return;

        const div = document.createElement("div");
        div.className = "event-item";

        // Immagine
        if (immagine) {
          const imgEl = document.createElement("img");
          imgEl.src = immagine;
          imgEl.alt = titolo;
          imgEl.classList.add("event-img");
          div.appendChild(imgEl);
        }

        // Titolo
        const h3 = document.createElement("h3");
        h3.textContent = titolo;
        div.appendChild(h3);

        // Data e orario
        const p1 = document.createElement("p");
        p1.innerHTML = `<strong>Data:</strong> ${formatDate(dataEvento)} <strong>Orario:</strong> ${orario}`;
        div.appendChild(p1);

        // Descrizione troncata + "Scopri di più"
        const p2 = document.createElement("p");
        const truncated = truncateText(descrizione);
        p2.innerHTML = `${truncated} <span class="more-text">Scopri di più</span>`;
        div.appendChild(p2);

        const moreText = p2.querySelector(".more-text");
        moreText.addEventListener("click", () => {
          openEventModal({ titolo, dataEvento, orario, descrizione, immagine, linkBiglietti });
        });

        container.appendChild(div);
      });
    })
    .catch(err => console.error("Errore caricamento eventi musica:", err));
});
