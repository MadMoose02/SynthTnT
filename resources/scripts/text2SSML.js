/**
 * Converts a word and its IPA pronunciation into an SSML phoneme tag.
 * @param {string} word The word to convert.
 * @param {string} ipa The IPA pronunciation of the word.
 * @returns {string} The SSML phoneme tag.
 */
function createSSMLPhoneme(word, ipa) {
    return `<phoneme alphabet="ipa" ph="${ipa}">${word}</phoneme>`;
}

/**
 * Fetches the IPA pronunciation of a word from the DTTEC API.
 * @param {string} word The word to query.
 * @returns {Promise<Object>} The API response containing the word's pronunciation or an error status.
 */
async function fetchWordPronunciation(word) {
    try {
        const endpoint = process.env.DTTEC_ENDPOINT || 'http://localhost';
        const port = process.env.DTTEC_PORT || '8080';
        const response = await fetch(`${endpoint}:${port}/get/${word}`);
        const data = await response.json();
        return data;
    } 
    catch (err) {
        console.error(`Error fetching pronunciation for word "${word}": ${err.message}`);
        return { status: 'ERROR' };
    }
}

/**
 * Converts a sentence into an SSML string. Words found in the DTTEC dictionary
 * are converted into SSML phoneme tags, while others are returned as-is.
 * @param {string} text The sentence to convert to SSML.
 * @returns {Promise<string>} The SSML string.
 */
export async function text2SSML(text) {
    const isQuestion = false;//text.includes('?');
    const sanitizedText = text;//text.toLowerCase().replace(/[^a-zA-Z\s]/g, '').trim();
    const words = sanitizedText.split(/\s+/);
    const tags = [];

    for (const word of words) {
        const response = await fetchWordPronunciation(word);

        if (response.status === 'OK') {
            const ssmlPhoneme = createSSMLPhoneme(word, response.pronunciation);
            tags.push(ssmlPhoneme);
        } 
        else {
            tags.push(word); // Use the word as-is if not found in the dictionary
        }
    }

    return `<s>${tags.join(' ')}${isQuestion ? '?' : ''}</s>`;
}