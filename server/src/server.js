const express = require("express");
const helmet = require("helmet");

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());

// Route definitions
app.get('/api/hello', (_, res) => {
  res.json({hello: 'World!'})
});

exports.createServer = (staticPath) => {
  return new Promise((resolve) => {
    app.use('/', express.static(staticPath));

    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${port}`);
      return resolve();
    });
  })
}
