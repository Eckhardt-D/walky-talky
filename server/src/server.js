const http = require('http')
const express = require("express");
const helmet = require("helmet");
const {Server} = require('socket.io');

// Route imports
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

const app = express();

const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(express.json());

// Route definitions
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

exports.createServer = (staticPath) => {
  return new Promise((resolve) => {
    // Expose the client static assets
    app.use('/', express.static(staticPath));

    const port = process.env.PORT || 3000;
    
    // Handle upvote events, inform clients
    io.on('connection', (socket) => {
      socket.on('upvoted', () => {
        socket.broadcast.emit('upvote');
      });
    });

    server.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${port}`);
      return resolve();
    });
  })
}
