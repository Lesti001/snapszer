const fs = require('node:fs');
const path = require('node:path');

const logFilePath = path.join(__dirname, '..', 'logs', 'searches.log');

const logDir = path.dirname(logFilePath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

exports.logMatchSearch = (name, isSuccess, errorMessage = '') => {
  const timestamp = new Date().toLocaleString('hu-HU', { timeZone: 'Europe/Budapest' });
  
  const status = isSuccess ? 'SIKERES' : `SIKERTELEN - ${errorMessage}`;
  
  const logLine = `[${timestamp}] Név: ${name} | ${status}\n`;

  fs.appendFile(logFilePath, logLine, 'utf8', (err) => {
    if (err) {
      console.error('Hiba a logfájl írásakor:', err);
    }
  });
};