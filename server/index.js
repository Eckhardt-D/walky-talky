const {createServer} = require('./src');
const config = require('../talky.config');

(async () => {
  await createServer(config.staticPath);
})();