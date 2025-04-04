import writeFile from 'fs';

/**
 * Formats a date object into a readable string (YYYY-MM-DD HH:MM:SS).
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
export function formatDateTime(_date = new Date()) {
    let date = new Date(_date.getTime() - (_date.getTimezoneOffset() * 60000));
    return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Generates a random string of a specified length.
 * @param {number} length - The length of the random string.
 * @returns {string} The generated random string.
 */
export function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Throttles a function, ensuring it is only called at most once in a specified interval.
 * @param {Function} func - The function to throttle.
 * @param {number} interval - The throttle interval in milliseconds.
 * @returns {Function} The throttled function.
 */
export function throttle(func, interval) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= interval) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}