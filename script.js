// ---------------------------
// Menu Hamburger
// ---------------------------
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const closeMenu = document.getElementById('close-menu');

hamburger.addEventListener('click', () => {
  navMenu.style.height = '100vh'; // usa viewport height, non %
});

closeMenu.addEventListener('click', () => {
  navMenu.style.height = '0';
});

// ---------------------------
// Carosello dinamico
// ---------------------------
const track = document.querySelector('.carousel-track');
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
let currentIndex = 0;

// Funzione per aggiornare la slide visibile
function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
}

// Eventi frecce
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
    const rows = data.split('\n').slice(1); // Salta intestazione
    rows.forEach(row => {
      if (!row.trim()) return; // salta righe vuote
      const [immagine, titolo, dataEvento, orario, descrizione] = row.split(',');

      const item = document.createElement('div');
      item.className = 'carousel-item';

      const img = document.createElement('img');
      img.src = immagine.trim();
      img.alt = titolo.trim();

      const caption = document.createElement('div');
      caption.className = 'carousel-caption';
      caption.innerHTML = `<h3>${titolo.trim()}</h3>
                           <p>${dataEvento.trim()} ${orario.trim()}</p>
                           <p>${descrizione.trim()}</p>`;

      item.appendChild(img);
      item.appendChild(caption);
      track.appendChild(item);
    });
    updateCarousel(); // mostra la prima slide
  })
  .catch(err => console.error('Errore nel caricamento CSV:', err));
