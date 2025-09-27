document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("eventi-teatro");
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

        if (tipo.toUpperCase() !== "TEATRO") return;

        const div = document.createElement("div");
        div.className = "event-item";

        // Crea immagine con classe event-img
        if (immagine) {
          const imgEl = document.createElement("img");
          imgEl.src = immagine;
          imgEl.alt = titolo;
          imgEl.classList.add("event-img"); // <- nuova classe per il CSS
          div.appendChild(imgEl);
        }

        // Titolo
        const h3 = document.createElement("h3");
        h3.textContent = titolo;
        div.appendChild(h3);

        // Data e orario
        const p1 = document.createElement("p");
        p1.innerHTML = `<strong>Data:</strong> ${dataEvento} <strong>Orario:</strong> ${orario}`;
        div.appendChild(p1);

        // Descrizione
        const p2 = document.createElement("p");
        p2.textContent = descrizione;
        div.appendChild(p2);

        // Link biglietti
        if (linkBiglietti) {
          const a = document.createElement("a");
          a.href = linkBiglietti;
          a.target = "_blank";
          a.className = "cta-button";
          a.textContent = "Prenota il tuo posto";
          div.appendChild(a);
        }

        container.appendChild(div);
      });
    })
    .catch(err => console.error("Errore caricamento eventi teatro:", err));
});
