const express = require('express');
const http = require('http');
const { exec } = require('child_process');
const { Server } = require('socket.io');
const si = require('systeminformation');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'));

// PowerTOP endpoint
app.get('/powertop', (req, res) => {
    exec('powertop --csv --time=1', (error, stdout, stderr) => {  // Changed command
        if (error) {
            console.error('PowerTOP error:', error);
            return res.status(500).send('Error getting PowerTOP data');
        }
        res.send(stdout);
    });
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('Client connected');
    const interval = setInterval(async () => {
        try {
            const [cpu, mem] = await Promise.all([
                si.currentLoad(),
                si.mem()
            ]);
            socket.emit('stats', {
                cpu: cpu.currentLoad.toFixed(1),
                mem: ((mem.used / mem.total) * 100).toFixed(1)
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, 1000);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

server.listen(88, () => {
    console.log('Dark mode dashboard running on port 88');
});
