const OSC = require('node-osc');
const server = new OSC.Server(8000, '127.0.0.1');  // Listening server
const client = new OSC.Client('127.0.0.1', 8001);  // Client to send messages

const numberOfCrowns = 5;
const frequency = 100; // Frequency in milliseconds
const parameters = ['gamma', 'beta', 'alpha', 'theta', 'delta'];

const startTime = Date.now();

// Frequencies for oscillations (in Hz)
const bandFrequencies = {
    'alpha': [0.1, 0.15, 0.2, 0.25, 0.3],
    'beta': [0.2, 0.25, 0.3, 0.35, 0.4],
    'gamma': [0.4, 0.45, 0.5, 0.55, 0.6],
    'theta': [0.05, 0.06, 0.07, 0.08, 0.09],
    'delta': [0.02, 0.03, 0.04, 0.05, 0.06]
};

// Simulate sending data with oscillating values
setInterval(() => {
    const elapsedTime = (Date.now() - startTime) / 5000; // Time in seconds

    for (let crownId = 1; crownId <= numberOfCrowns; crownId++) {
        parameters.forEach(param => {
            let value;
            const frequency = bandFrequencies[param][crownId - 1];
            // Calculate the value using a sine wave for each band
            value = (Math.sin(2 * Math.PI * frequency * elapsedTime) + 1) / 2; // Normalize to range [0, 1]
            client.send(`/crown${crownId}/${param}`, value);
        });
    }
}, frequency);

// Graceful shutdown
process.on('SIGINT', () => {
    client.close();
    server.close();
    console.log('OSC Server and Client closed');
    process.exit();
});
