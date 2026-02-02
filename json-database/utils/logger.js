import chalk from 'chalk';

const LOG_LEVELS = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const ENV = process.env.NODE_ENV || 'development';
const MIN_LEVEL = LOG_LEVELS[process.env.MIN_LOG_LEVEL];

export function log(level, message, meta = {}) {
  // Seviye validation
  if (!LOG_LEVELS.hasOwnProperty(level)) {
    console.error(`Invalid log level: ${level}`);
    return;
  }

  // Log seviyesi filtrelemesi
  if (LOG_LEVELS[level] > MIN_LEVEL) return;

  // Error object handling
  const logData = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
    // Error varsa stack trace'i ekle
    ...(meta.error instanceof Error && {
      error: {
        message: meta.error.message,
        stack: ENV === 'development' ? meta.error.stack : undefined
      }
    })
  };

  // Renkler
  const levelColors = {
    ERROR: chalk.red.bold,
    WARN: chalk.yellow.bold,
    INFO: chalk.green.bold,
    DEBUG: chalk.cyan.bold
  };

  // Zaman formatı
  const dateObj = new Date();
  const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour12: false });
  const dateStr = dateObj.toLocaleDateString('tr-TR');

  // Başlık
  let output = chalk.gray('\n==== LOG ENTRY ====\n');
  output += chalk.white(`Time   : ${timeStr} - ${dateStr}\n`);
  output += `Level  : ${levelColors[level](level)}\n`;
  output += chalk.white(`Message: ${message}\n`);

  // Meta bilgileri
  Object.entries(meta).forEach(([key, value]) => {
    if (key === 'error' && value instanceof Error) {
      output += chalk.red(`Error  : ${value.message}\n`);
      if (ENV === 'development' && value.stack) {
        output += chalk.redBright(`Stack  : ${value.stack}\n`);
      }
    } else if (typeof value === 'object' && value !== null) {
      output += chalk.white(`${key}: ${JSON.stringify(value, null, 2)}\n`);
    } else {
      output += chalk.white(`${key}: ${value}\n`);
    }
  });

  output += chalk.gray('===================\n');
  process.stdout.write(output);
}
