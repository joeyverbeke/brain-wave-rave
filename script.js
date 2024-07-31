function updateCrowns() {
    fetch('/api/crowns')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('crowns-container');
            container.innerHTML = '';

            if (Object.keys(data).length === 0) {
                // If data is empty, we've already cleared the container
                return;
            }

            Object.entries(data).forEach(([name, crown]) => {
                const crownElement = document.createElement('div');
                crownElement.className = 'crown';
                crownElement.innerHTML = `
                    <h2>Crown-${name.slice(5, 9).toUpperCase()}</h2>
                    <p>Battery: ${crown.battery || 0}%</p>
                    <p>Signal Quality: ${crown.signalQuality}</p>
                    <p>Last Seen: ${new Date(crown.lastSeen).toLocaleTimeString()}</p>
                `;
                container.appendChild(crownElement);
            });
        })
        .catch(error => console.error('Error:', error));
}

setInterval(updateCrowns, 1000);