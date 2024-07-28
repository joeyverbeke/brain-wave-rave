// A file to show all connected Crowns on the local network streaming over OSC

const osc = require('node-osc');
const oscServer = new osc.Server(9000, '0.0.0.0'); // Listen on all interfaces

const activeCrowns = {};
const crownTimeout = 5000; // 5 seconds timeout

oscServer.on('message', (msg) => {
    if (msg[0].includes('/battery')) {
        const crownName = msg[0].split('/')[1];
        if (!activeCrowns[crownName]) {
            activeCrowns[crownName] = {};
        }
        activeCrowns[crownName].lastSeen = Date.now();
        activeCrowns[crownName].battery = msg[1];
    } else if (msg[0].startsWith('/crown')) {
        const crownName = msg[0].split('/')[1]; // Extract crown name from the message
        if (!activeCrowns[crownName]) {
            activeCrowns[crownName] = {};
        }
        activeCrowns[crownName].lastSeen = Date.now(); // Update the last seen time for this crown
    }
});

setInterval(() => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString(); // Get current time in hour:min:sec format
    const activeCrownNames = Object.keys(activeCrowns).filter(crown => now - activeCrowns[crown].lastSeen <= crownTimeout);
    if (activeCrownNames.length > 0) {
        const crownStatuses = activeCrownNames.map(name => {
            const battery = activeCrowns[name].battery || 'unknown';
            return `Crown-${name.slice(5, 9).toUpperCase()} ${battery}%`;
        }).join(' | ');
        console.log(`${currentTime} | ${crownStatuses}`);
    } else {
        console.log(`Searching for Crowns at ${currentTime}...`);
    }
}, 1000); // Print active crowns every second
