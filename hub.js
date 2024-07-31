// A file to show all connected Crowns on the local network streaming over OSC

const osc = require('node-osc');
const oscServer = new osc.Server(9000, '0.0.0.0'); // Listen on all interfaces

const activeCrowns = {};
const crownTimeout = 5000; // 5 seconds timeout

oscServer.on('message', (msg) => {
    // console.log(msg);
    if (msg[0].startsWith('/crown') && msg[0].includes('/gamma')) {
        const crownName = msg[0].split('/')[1]; // Extract crown name from the message
        if (!activeCrowns[crownName]) {
            activeCrowns[crownName] = { signalQuality: 0, battery: 0 };
        }
        activeCrowns[crownName].lastSeen = Date.now(); // Update the last seen time for this crown gamma
    } else if (msg[0].includes('/battery')) {
        const crownName = msg[0].split('/')[1];
        if (activeCrowns[crownName]) {
            activeCrowns[crownName].battery = msg[1];
        }
    } else if (msg[0].includes('/signalQuality')) {
        const crownName = msg[0].split('/')[1];
        if (activeCrowns[crownName]) {
            activeCrowns[crownName].signalQuality = msg[1];
        }
    }
});

setInterval(() => {
    const now = new Date();
    const currentTime = now.toLocaleTimeString(); // Get current time in hour:min:sec format
    
    // Remove timed out crowns
    Object.keys(activeCrowns).forEach(crown => {
        if (now - activeCrowns[crown].lastSeen > crownTimeout) {
            delete activeCrowns[crown];
        }
    });

    const activeCrownNames = Object.keys(activeCrowns);
    if (activeCrownNames.length > 0) {
        const crownStatuses = activeCrownNames.map(name => {
            const battery = activeCrowns[name].battery || 0;
            const signalQuality = activeCrowns[name].signalQuality;
            return `Crown-${name.slice(5, 9).toUpperCase()} ${battery}% SQ:${signalQuality}`;
        }).join(' | ');
        console.log(`${currentTime} | ${crownStatuses}`);
    } else {
        console.log(`Searching for Crowns at ${currentTime}...`);
    }
}, 1000); // Print active crowns every second

const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            }
        });
    } else if (req.url === '/script.js') {
        fs.readFile(path.join(__dirname, 'script.js'), (err, content) => {
            if (err) {
                console.error('Error reading script.js:', err);
                res.writeHead(500);
                res.end('Error loading script.js');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(content);
            }
        });
    } else if (req.url === '/api/crowns') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(activeCrowns));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});