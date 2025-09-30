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

    // ---------------------------
    // Caricamento CSV con PapaParse
    // ---------------------------
    Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vTsHetVu62LIgBfbWqJ9AX5vRjWJBiN01Wspsj51i8nr9z5pWKqVb2jG3Zy_aAwJKjN0OiYxZ4mx9-1/pub?output=csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        results.data.forEach(event => {
          const { immagine, titolo, dataEvento, orario, descrizione, linkBiglietti } = event;

          const item = document.createElement('div');
          item.className = 'carousel-item';

          if (immagine) {
            const img = document.createElement('img');
            img.src = immagine;
            img.alt = titolo;
            item.appendChild(img);
          }

          const caption = document.createElement('div');
          caption.className = 'carousel-caption';

          const truncated = truncateText(descrizione);
          caption.innerHTML = `
            <h3>${titolo}</h3>
            <p>${dataEvento} ${orario}</p>
            <p>${truncated} <span class="more-text">Scopri di più</span></p>
          `;

          const moreText = caption.querySelector('.more-text');
          moreText.addEventListener('click', () => {
            openEventModal({ titolo, dataEvento, orario, descrizione, immagine, linkBiglietti });
          });

          item.appendChild(caption);
          track.appendChild(item);
        });
        updateCarousel();
      }
    });
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
    if(modal) modal.classList.add('active');
  }

  function closeEventModal() {
    if(modal) modal.classList.remove('active');
  }

  if (modalClose) modalClose.addEventListener('click', closeEventModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeEventModal();
    });
  }

  // ---------------------------
  // Cookie Banner
  // ---------------------------
  const banner = document.getElementById('cookie-banner');
  const btn = document.getElementById('accept-cookies');

  if (banner && btn) {
    if (!localStorage.getItem('cookiesAccepted')) {
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }

    btn.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      banner.style.display = 'none';
    });
  }
});
