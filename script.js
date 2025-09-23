document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Carosello dinamico
  // ---------------------------
  const track = document.querySelector('.carousel-track');
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  let currentIndex = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  if(prevButton && nextButton && track){
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
          if (columns.length < 5) return;

          const [immagine, titolo, dataEvento, orario, descrizione] = columns;

          const item = document.createElement('div');
          item.className = 'carousel-item';

          const img = document.createElement('img');
          img.src = immagine;
          img.alt = titolo;

          const caption = document.createElement('div');
          caption.className = 'carousel-caption';
          caption.innerHTML = `<h3>${titolo}</h3>
                               <p>${dataEvento} ${orario}</p>
                               <p>${descrizione}</p>`;

          item.appendChild(img);
          item.appendChild(caption);
          track.appendChild(item);
        });
        updateCarousel(); // mostra la prima slide
      })
      .catch(err => console.error('Errore nel caricamento CSV:', err));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookie-banner');
  const btn = document.getElementById('accept-cookies');

  // Controlla se l'utente ha già accettato
  if (!localStorage.getItem('cookiesAccepted')) {
    banner.style.display = 'flex';
  }

  btn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    banner.style.display = 'none';
  });
});

