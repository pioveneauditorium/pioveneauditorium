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

  function truncateText(text, wordLimit = 15) {
    if (!text) return "";
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
    // Carica slide dinamiche dal CSV
    // ---------------------------
    Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vTsHetVu62LIgBfbWqJ9AX5vRjWJBiN01Wspsj51i8nr9z5pWKqVb2jG3Zy_aAwJKjN0OiYxZ4mx9-1/pub?output=csv', {
      download: true,
      header: true,
      complete: (results) => {
        results.data.forEach((row) => { 
  if (!row.Immagine || !row.Titolo) return;

  const immagine = row.Immagine.trim();
  const titolo = row.Titolo.trim();
  const dataEvento = row.Data?.trim() || "";
  const orario = row.Orario?.trim() || "";
  const descrizione = row.Descrizione?.trim() || "";
  const linkBiglietti = row.linkBiglietti?.trim() || "";

          const item = document.createElement('div');
          item.className = 'carousel-item';

          const img = document.createElement('img');
          img.src = immagine;
          img.alt = titolo;
          img.loading = "lazy";

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

          item.appendChild(img);
          item.appendChild(caption);
          track.appendChild(item);
        });
        updateCarousel();
      },
      error: (err) => {
        console.error('Errore nel caricamento del CSV del carosello:', err);
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
      <p>${eventData.descrizione.replace(/\n/g, '<br>')}</p>
      ${eventData.linkBiglietti ? `<a href="${eventData.linkBiglietti}" target="_blank" class="cta-button">Prenota il tuo posto</a>` : ''}
    `;
    if (modal) modal.classList.add('active');
  }

  function closeEventModal() {
    if (modal) modal.classList.remove('active');
  }

  if (modalClose) modalClose.addEventListener('click', closeEventModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeEventModal(); });

  // ---------------------------
  // Cookie Banner conforme GDPR
  // ---------------------------
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById('reject-cookies');

  // Carica Google Analytics solo dopo consenso
  function enableAnalytics() {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-YBSGEL3RZH";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YBSGEL3RZH');
  }

  const cookieChoice = localStorage.getItem('cookieConsent');

  if (!cookieChoice && banner) {
    banner.style.display = 'flex';
  } else if (cookieChoice === 'accepted') {
    enableAnalytics();
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      banner.style.display = 'none';
      enableAnalytics();
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'rejected');
      banner.style.display = 'none';
    });
  }
});
