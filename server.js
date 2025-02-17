const express = require('express');
const http = require('http');
const { exec } = require('child_process');
const SocketIO = require('socket.io');
const si = require('systeminformation');

const app = express();
const server = http.createServer(app);
const io = SocketIO(server);

// Serve static files
app.use(express.static('public'));

// PowerTOP data endpoint
app.get('/powertop', (req, res) => {
    exec('powertop --csv', (error, stdout) => {
        res.send(stdout);
    });
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
    setInterval(async () => {
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        socket.emit('stats', {
            cpu: cpu.currentload.toFixed(1),
            mem: ((mem.used / mem.total) * 100).toFixed(1)
        });
    }, 1000);
});

server.listen(88, () => {
    console.log('Server running on port 88');
});
