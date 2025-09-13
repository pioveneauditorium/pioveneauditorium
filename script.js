// ---------------------------
// Menu Hamburger
// ---------------------------
const hamburger = document.querySelector('.hamburger');
const navMenu = document.getElementById('nav-menu');
const closeMenu = document.querySelector('.close-menu');

// Apri/chiudi menu cliccando sull'hamburger
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

// Chiudi cliccando sulla X (solo se esiste)
if (closeMenu) {
  closeMenu.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
}

// Chiudi cliccando su un link del menu
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
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
    // Split righe supportando sia \n che \r\n
    const rows = data.split(/\r?\n/).slice(1); // Salta intestazione

    rows.forEach(row => {
      if (!row.trim()) return; // salta righe vuote
      
      // Split colonne e rimuove caratteri invisibili
      const columns = row.split(',').map(c => c.replace(/\r/g, '').trim());
      if (columns.length < 5) return; // Assicura che ci siano tutte le colonne

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
