const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(configPath)) {
  throw new Error(
    'config.json not found. Create it with:\n' +
    '  ln -sf config-development.json config.json\n' +
    'or ln -sf config-production.json config.json on a server.'
  );
}

const config = require(configPath);

module.exports = config;