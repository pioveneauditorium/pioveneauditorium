document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Carosello dinamico
  // ---------------------------
  const track = document.querySelector('.carousel-track');
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  let currentIndex = 0;

  function updateCarousel() {
    if (track) track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  // Funzione per tagliare la descrizione a tot parole
  function truncateText(text, wordLimit = 25) {
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '…';
  }

  if (prevButton && nextButton && track) {
    prevButton.addEventListener('click', () => {
      currentIndex = (currentIndex === 0) ? track.children.length - 1 : currentIndex - 1;
      updateCarousel();
    });

    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex === track.children.length - 1) ? 0 : currentIndex + 1;
      updateCarousel();
    });

    // Fetch CSV Google Sheet e creazione dinamica delle slide
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTsHetVu62LIgBfbWqJ9AX5vRjWJBiN01Wspsj51i8nr9z5pWKqVb2jG3Zy_aAwJKjN0OiYxZ4mx9-1/pub?output=csv')
      .then(response => response.text())
      .then(data => {
        const rows = data.split(/\r?\n/).slice(1); // Salta intestazione
        rows.forEach(row => {
          if (!row.trim()) return;
          const columns = row.split(',').map(c => c.replace(/\r/g, '').trim());
          if (columns.length < 6) return; // ora ci aspettiamo anche linkBiglietti

          const [immagine, titolo, dataEvento, orario, descrizione, linkBiglietti] = columns;

          const item = document.createElement('div');
          item.className = 'carousel-item';

          const img = document.createElement('img');
          img.src = immagine;
          img.alt = titolo;

          const caption = document.createElement('div');
          caption.className = 'carousel-caption';
          caption.innerHTML = `<h3>${titolo}</h3>
                               <p>${dataEvento} ${orario}</p>
                               <p>${truncateText(descrizione)}</p>`;

          // Bottone "Scopri di più"
          const moreBtn = document.createElement('button');
          moreBtn.textContent = "Scopri di più";
          moreBtn.className = "cta-button";
          moreBtn.addEventListener('click', () => {
            openEventModal({ titolo, dataEvento, orario, descrizione, immagine, linkBiglietti });
          });
          caption.appendChild(moreBtn);

          item.appendChild(img);
          item.appendChild(caption);
          track.appendChild(item);
        });
        updateCarousel(); // mostra la prima slide
      })
      .catch(err => console.error('Errore nel caricamento CSV:', err));
  }

  // ---------------------------
  // Popup scheda evento
  // ---------------------------
  const modal = document.getElementById('event-modal');
  const modalBody = document.getElementById('event-modal-body');
  const modalClose = document.querySelector('.event-modal-close');

  function openEventModal(eventData) {
    modalBody.innerHTML = `
      ${eventData.immagine ? `<img src="${eventData.immagine}" alt="${eventData.titolo}">` : ''}
      <h3>${eventData.titolo}</h3>
      <p><strong>${eventData.dataEvento} ${eventData.orario}</strong></p>
      <p>${eventData.descrizione}</p>
      ${eventData.linkBiglietti ? `<a href="${eventData.linkBiglietti}" target="_blank" class="cta-button">Prenota il tuo posto</a>` : ''}
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // blocca lo scroll della pagina dietro
  }

  function closeEventModal() {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // ripristina scroll
  }

  modalClose.addEventListener('click', closeEventModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeEventModal(); // chiudi cliccando fuori
  });

  // ---------------------------
  // Cookie Banner
  // ---------------------------
  const banner = document.getElementById('cookie-banner');
  const btn = document.getElementById('accept-cookies');

  if (banner && btn) {
    // Mostra banner solo se non accettato
    if (!localStorage.getItem('cookiesAccepted')) {
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }

    // Al click accetta i cookie
    btn.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      banner.style.display = 'none';
    });
  }
});
