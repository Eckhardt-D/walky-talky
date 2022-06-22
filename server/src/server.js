const express = require("express");
const helmet = require("helmet");

// Route imports
const userRoutes = require('./routes/users');

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());

// Route definitions
app.use('/api/users', userRoutes);

exports.createServer = (staticPath) => {
  return new Promise((resolve) => {
    // Expose the client static assets
    app.use('/', express.static(staticPath));

    const port = process.env.PORT || 3000;

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${port}`);
      return resolve();
    });
  })
}
