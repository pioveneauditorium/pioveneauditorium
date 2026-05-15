document.addEventListener("DOMContentLoaded", () => {

  // ---------------------------
  // UTIL: LOAD HTML (header/footer)
  // ---------------------------
  function loadHTML(containerId, url, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(url)
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
        if (callback) callback();
      })
      .catch(err => console.error(`Errore nel caricamento ${url}:`, err));
  }

  // ---------------------------
  // HEADER + HAMBURGER (ACCESSIBILE)
  // ---------------------------
  loadHTML('header-container', 'header.html', () => {

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (!hamburger || !navMenu) return;

    const focusableSelector = 'a, button';

    const closeMenu = () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      navMenu.classList.add('active');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
    };

    const toggleMenu = () => {
      const isOpen = navMenu.classList.contains('active');
      isOpen ? closeMenu() : openMenu();
    };

    // click hamburger
    hamburger.addEventListener('click', toggleMenu);

    // click su link -> chiudi menu
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // ESC chiude menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // FOCUS TRAP (TAB dentro menu)
    document.addEventListener('keydown', (e) => {
      if (!navMenu.classList.contains('active')) return;
      if (e.key !== 'Tab') return;

      const focusable = navMenu.querySelectorAll(focusableSelector);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

  });

  // ---------------------------
  // FOOTER
  // ---------------------------
  loadHTML('footer-container', 'footer.html');

  // ---------------------------
  // CAROSELLO
  // ---------------------------
  const track = document.querySelector('.carousel-track');
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  let currentIndex = 0;

  function updateCarousel() {
    if (!track) return;

    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    const video = document.getElementById('slide-video');
    if (video && currentIndex === 0 && video.paused) video.play();
  }

  function truncateText(text, wordLimit = 15) {
    if (!text) return "";
    const words = text.split(/\s+/);
    return words.length <= wordLimit
      ? text
      : words.slice(0, wordLimit).join(' ') + '…';
  }

  if (prevButton && nextButton && track) {

    prevButton.addEventListener('click', () => {
      currentIndex =
        currentIndex === 0
          ? track.children.length - 1
          : currentIndex - 1;

      updateCarousel();
    });

    nextButton.addEventListener('click', () => {
      currentIndex =
        currentIndex === track.children.length - 1
          ? 0
          : currentIndex + 1;

      updateCarousel();
    });

    // CSV EVENTS
    Papa.parse('https://docs.google.com/spreadsheets/d/e/2PACX-1vTsHetVu62LIgBfbWqJ9AX5vRjWJBiN01Wspsj51i8nr9z5pWKqVb2jG3Zy_aAwJKjN0OiYxZ4mx9-1/pub?output=csv', {
      download: true,
      header: true,
      complete: (results) => {

        results.data.forEach((row) => {
          if (!row.Immagine || !row.Titolo) return;

          const item = document.createElement('div');
          item.className = 'carousel-item';

          const img = document.createElement('img');
          img.src = row.Immagine.trim();
          img.alt = row.Titolo.trim();
          img.loading = "lazy";

          const caption = document.createElement('div');
          caption.className = 'carousel-caption';

          const desc = row.Descrizione?.trim() || "";

          caption.innerHTML = `
            <h3>${row.Titolo.trim()}</h3>
            <p>${row.Data || ""} ${row.Orario || ""}</p>
            <p>${truncateText(desc)} <span class="more-text">Scopri di più</span></p>
          `;

          caption.querySelector('.more-text')
            .addEventListener('click', () => {
              openEventModal({
                titolo: row.Titolo,
                dataEvento: row.Data,
                orario: row.Orario,
                descrizione: desc,
                immagine: row.Immagine,
                linkBiglietti: row.linkBiglietti
              });
            });

          item.appendChild(img);
          item.appendChild(caption);
          track.appendChild(item);
        });

        updateCarousel();
      }
    });
  }

  // ---------------------------
  // MODAL EVENTO
  // ---------------------------
  const modal = document.getElementById('event-modal');
  const modalBody = document.getElementById('event-modal-body');
  const modalClose = document.querySelector('.event-modal-close');

  function openEventModal(data) {
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      ${data.immagine ? `<img src="${data.immagine}" alt="${data.titolo}">` : ''}
      <h3>${data.titolo}</h3>
      <p><strong>${data.dataEvento} ${data.orario}</strong></p>
      <p>${(data.descrizione || "").replace(/\n/g, "<br>")}</p>
      ${data.linkBiglietti ? `<a href="${data.linkBiglietti}" target="_blank" class="cta-button">Prenota</a>` : ''}
    `;

    modal.classList.add('active');
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // ESC chiude modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ---------------------------
  // COOKIE BANNER
  // ---------------------------
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById('reject-cookies');

  const cookieChoice = localStorage.getItem('cookieConsent');

  if (!cookieChoice && banner) banner.style.display = 'flex';

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'accepted');
      banner.style.display = 'none';
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      localStorage.setItem('cookieConsent', 'rejected');
      banner.style.display = 'none';
    });
  }

  // ---------------------------
  // VIDEO CLICK PLAY/PAUSE
  // ---------------------------
  const video = document.getElementById('slide-video');

  if (video) {
    video.addEventListener('click', () => {
      video.paused ? video.play() : video.pause();
    });
  }

  // ---------------------------
  // ANIMAZIONI IMMAGINI
  // ---------------------------
  const images = document.querySelectorAll(".paragraph-image");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  images.forEach(img => observer.observe(img));

  // INIT CAROSELLO
  updateCarousel();
});