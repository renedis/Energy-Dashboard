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

app.get('/powertop', (req, res) => {
  exec('powertop --csv --time=1', (error, stdout) => {
    if (error) return res.status(500).json({ error: 'PowerTOP failed' });

    const cstates = [];
    const lines = stdout.split('\n');
    let inPackageSection = false;

    lines.forEach(line => {
      // Start processing after Processor Idle State Report
      if (line.includes('Processor Idle State Report')) {
        inPackageSection = true;
        return;
      }

      if (inPackageSection) {
        // Stop processing at next major section
        if (line.startsWith('____________________________________________________________________')) {
          inPackageSection = false;
          return;
        }

        // Capture package-level C-States
        if (line.startsWith('C') && line.includes('(pc')) {
          const parts = line.split(';').map(p => p.trim());
          if (parts.length >= 2) {
            const [name] = parts[0].split(' ');
            cstates.push({
              name: name,
              residency: parts[1]
            });
          }
        }
      }
    });

    res.json({ raw: stdout, cstates });
  });
});

// WebSocket for real-time stats
io.on('connection', (socket) => {
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
      console.error('Stats error:', error);
    }
  }, 1000);

  socket.on('disconnect', () => clearInterval(interval));
});

server.listen(88, () => console.log('Server running on port 88'));
