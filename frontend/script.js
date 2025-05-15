document.addEventListener("DOMContentLoaded", () => {
  // Fetch golf status
  fetch('/api/scrape')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const container = document.getElementById("golf-status");
      container.innerHTML = '';
      data.forEach(item => {
        const p = document.createElement('p');
        const statusText = item.status.toLowerCase();

        const span = document.createElement('span');
        span.textContent = item.status;
        span.className = 'status ' +
          (statusText.includes("open") || statusText.includes("ja") || statusText.includes("zomergreens")
            ? 'status-open'
            : 'status-closed');

        p.innerHTML = `<strong>${item.label}</strong>`;
        p.appendChild(span);

        container.appendChild(p);
      });
    })
    .catch(err => {
      document.getElementById("golf-status").innerHTML =
        '<p class="loading">Fout bij het laden van de status.</p>';
      console.error("Golf status fetch error:", err);
    });

  // Fetch evenementen (events)
  fetch('/api/events')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(events => {
      const eventsContainer = document.getElementById('events');
      if (!eventsContainer) {
        console.error('Events container (#events) not found in DOM.');
        return;
      }

      eventsContainer.innerHTML = ''; // Clear loading text

      if (!events.length) {
        eventsContainer.innerHTML = '<p class="loading">Geen evenementen gevonden.</p>';
        return;
      }

      events.forEach(event => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${event.title}</strong>`;

        if (event.dates && event.dates.length) {
          event.dates.forEach(date => {
            const dateEl = document.createElement('small');
            dateEl.textContent = date;
            dateEl.style.display = 'block';
            p.appendChild(dateEl);
          });
        }

        eventsContainer.appendChild(p);
      });
    })
    .catch(err => {
      const eventsContainer = document.getElementById('events');
      if (eventsContainer) {
        eventsContainer.innerHTML = '<p class="loading">Fout bij het laden van de evenementen.</p>';
      }
      console.error("Events fetch error:", err);
    });
});