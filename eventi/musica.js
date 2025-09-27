document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventi-musica");
  if (!container) return;

  fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRSqROrdJEDeejhnLMrFq9tTIvX4XUTRz8719e9xflNmyNAYaQB3h_JfM8E9Mes5AVKgaXGKMIDo-pN/pub?output=csv')
    .then(res => res.text())
    .then(data => {
      const rows = data.trim().split('\n').slice(1); // Salta header
      rows.forEach(row => {
        if (!row.trim()) return;
        const columns = row.split(',').map(c => c.trim());
        if (columns.length < 7) return; // consideriamo anche la colonna Tipo

        const [dataEvento, orario, titolo, descrizione, immagine, linkBiglietti, tipo] = columns;

        if (tipo.toUpperCase() !== "MUSICA") return;

        const div = document.createElement("div");
        div.className = "event-item";
        div.innerHTML = `
          ${immagine ? `<img src="${immagine}" alt="${titolo}">` : ''}
          <h3>${titolo}</h3>
          <p><strong>Data:</strong> ${dataEvento} <strong>Orario:</strong> ${orario}</p>
          <p>${descrizione}</p>
          ${linkBiglietti ? `<a href="${linkBiglietti}" target="_blank" class="cta-button">Prenota il tuo posto</a>` : ''}
        `;
        container.appendChild(div);
      });
    })
    .catch(err => console.error("Errore caricamento eventi musica:", err));
});
