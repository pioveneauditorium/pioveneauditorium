document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventi-cinema");
  if (!container) return;

  function truncateText(text, wordLimit = 15) {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '…';
  }

  function formatDate(dateString) {
    const months = [
      "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
      "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"
    ];
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const year = parts[0];
    const month = months[parseInt(parts[1], 10) - 1];
    const day = parseInt(parts[2], 10);
    return `${day} ${month} ${year}`;
  }

  // --- Modale evento ---
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
    // Crea link WhatsApp con messaggio precompilato
    const siteURL = window.location.origin;
    const whatsappText = `Guarda questo evento: ${eventData.titolo}%0A📅 ${formatDate(eventData.dataEvento)} - ${eventData.orario}%0A👉 ${siteURL}`;
    const whatsappLink = `https://api.whatsapp.com/send?text=${whatsappText}`;

    modalBody.innerHTML = `
      ${eventData.immagine ? `<img src="${eventData.immagine}" alt="${eventData.titolo}">` : ''}
      <h3>${eventData.titolo}</h3>
      <p><strong>Data:</strong> ${formatDate(eventData.dataEvento)} <strong>Orario:</strong> ${eventData.orario}</p>
      <p>${(eventData.descrizione || '').replace(/\n/g, '<br>')}</p>
      ${eventData.linkBiglietti ? `<a href="${eventData.linkBiglietti}" target="_blank" class="cta-button">Prenota il tuo posto</a>` : ''}
      <a href="${whatsappLink}" target="_blank" class="whatsapp-share">
        <i class="fab fa-whatsapp"></i> Condividi evento
      </a>
    `;
    modal.classList.add("active");
  }

  function closeEventModal() {
    modal.classList.remove("active");
  }

  modalClose.addEventListener("click", closeEventModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeEventModal(); });

  // Inizializza array JSON-LD
    window.eventiCinemaJSONLD = [];

  // Carica CSV con PapaParse
  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRSqROrdJEDeejhnLMrFq9tTIvX4XUTRz8719e9xflNmyNAYaQB3h_JfM8E9Mes5AVKgaXGKMIDo-pN/pub?output=csv')
    .then(res => res.text())
    .then(csvText => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          results.data.forEach(row => {
            if (!row.Tipo || row.Tipo.toUpperCase() !== "CINEMA") return;

            const dataEvento = row.Data?.trim();
            const orario = row.Orario?.trim();
            const titolo = row.Titolo?.trim();
            const descrizione = row.Descrizione?.trim();
            const immagine = row.Immagine?.trim();
            const linkBiglietti = row.linkBiglietti?.trim();

            // --- Genera evento visibile ---
            const div = document.createElement("div");
            div.className = "event-item";

            if (immagine) {
              const imgEl = document.createElement("img");
              imgEl.src = immagine;
              imgEl.alt = titolo;
              imgEl.classList.add("event-img");
              div.appendChild(imgEl);
            }

            const h3 = document.createElement("h3");
            h3.textContent = titolo;
            div.appendChild(h3);

            const p1 = document.createElement("p");
            p1.innerHTML = `<strong>Data:</strong> ${formatDate(dataEvento)} <strong>Orario:</strong> ${orario}`;
            div.appendChild(p1);

            const p2 = document.createElement("p");
            const truncated = truncateText(descrizione);
            p2.innerHTML = `${truncated} <span class="more-text">Scopri di più</span>`;
            div.appendChild(p2);

            const moreText = p2.querySelector(".more-text");
            moreText.addEventListener("click", () => {
              openEventModal({ titolo, dataEvento, orario, descrizione, immagine, linkBiglietti });
            });

            container.appendChild(div);

            // --- JSON-LD per SEO ---
            const eventJSONLD = {
              "@context": "https://schema.org",
              "@type": "Event",
              "name": titolo,
              "startDate": `${dataEvento}T${orario}`,
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
              "image": immagine || "https://pioveneauditorium.it/img/logo2.png",
              "description": descrizione,
              "offers": {
                "@type": "Offer",
                "url": linkBiglietti || window.location.href,
                "price": "0",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              },
              "performer": {
                "@type": "PerformingGroup",
                "name": "Piovene Auditorium"
              }
            };

            window.eventiCinemaJSONLD.push(eventJSONLD);
          });

          // Aggiorna JSON-LD nello script della pagina
          const jsonLdScript = document.getElementById('json-ld-events');
          if (jsonLdScript) {
            jsonLdScript.textContent = JSON.stringify(window.eventiCinemaJSONLD);
          }
        },
        error: function(err) {
          console.error("Errore parsing CSV cinema:", err);
        }
      });
    })
    .catch(err => console.error("Errore caricamento CSV cinema:", err));
});

// --- Loader: rimuovi dopo 1.5s ---
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) loader.remove();
  }, 1500);
});
