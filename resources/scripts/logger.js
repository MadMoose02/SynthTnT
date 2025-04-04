import { existsSync, mkdirSync, appendFile } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { formatDateTime } from './utils.js';

// Define the log file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFilePath = join(
    __dirname, 
    `../logs/${formatDateTime().replace(/:/g, '-')}.log`
);

// Ensure the logs directory exists
if (!existsSync(dirname(logFilePath))) {
    mkdirSync(dirname(logFilePath), { recursive: true });
}

/**
 * Logs a message to the console and a log file.
 * @param {string} level - The log level (e.g., INFO, ERROR, WARN).
 * @param {string} message - The message to log.
 */
function log(level, message) {
    const timestamp = formatDateTime();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    // Log to console
    switch (level) {
        case 'INFO':
            console.info(logMessage);
            break;
        case 'WARN':
            console.warn(logMessage);
            break;
        case 'ERROR':
            console.error(logMessage);w
            break;
        default:
            console.log(logMessage);
            break;
    }

    // Append to log file
    appendFile(logFilePath, logMessage + '\n', (err) => {
        if (err) {
            console.error(`[${timestamp}] [ERROR] Failed to write to log file: ${err.message}`);
        }
    });
}

/**
 * Writes raw messages directly to the log file without timestamps or log levels.
 * @param {string} message - The raw message to write to the log file.
 */
function writeRaw(message) {
    return new Promise((resolve, reject) => {
        appendFile(logFilePath, message + '\n', (err) => {
            if (err) {
                console.error(`[ERROR] Failed to write raw message to log file: ${err.message}`);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

// Convenience methods for different log levels
const logger = {
    info: (message) => log('INFO', message),
    warn: (message) => log('WARN', message),
    error: (message) => log('ERROR', message),
    writeRaw: (message) => writeRaw(message)
};

export default logger;