import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { convert } from './scripts/text2SSML.js';
import { setAPIKey, getTTSVoices, setTTSVoice, synthesiseAudio } from './scripts/watson-web.js';

/* Check if .env file exists */
if (!fs.existsSync('.env')) {
    console.error('ERROR: .env file not found. Core functionality may not work as expected.');
} else {
    console.log(`Loaded .env file`);
}

/* Load env variables */
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = __dirname + '/routes/';
const ttsVoice = process.env.IBM_TTS_VOICE || 'en-US_Allison';

/* Middlewares */
app.use(express.json());
app.use(express.static(__dirname));

/**
 * Get the date and time of the request in the format YYYY-MM-DD HH:MM:SS
 * 
 * @returns {string} The date and time of the request
 */
function getDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds() + 1;
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/**
 * Gets the trascription from file for the specified audio file
 * 
 * @param   {string} filename The name of the audio file
 * @returns {string} The transcript string for the specified audio file
 */
function getTranscript(filename) {
    const filePath = path.join(__dirname, 'audio-tests', 'transcripts.json');
    const transcript = JSON.parse(fs.readFileSync(filePath, 'utf8'))[filename];
    return transcript;
}

/* Health check */
app.get('/health', function (req, res) {
    console.log(`[${getDateTime()}] Health check`)
    res.status(200).send('OK');
});

/* Serve home page */
app.get('/', function (req, res) {
    console.log(`[${getDateTime()}] Serving home page`)
    res.status(200).sendFile(baseDir + 'index.html');
});

/* Serve testing page */
app.get('/testing', function (req, res) {
    console.log(`[${getDateTime()}] Serving testing page`)
    res.status(200).sendFile(baseDir + 'testing.html');
});

/* Fetch IBM token from environment variable */
app.get('/authorise', function (req, res) {
    let status = setAPIKey(process.env.IBM_API_TOKEN);
    console.log(`[${getDateTime()}] Set IBM Cloud API token: ${status ? 'Success' : 'Failed'}`);
    status = setTTSVoice(ttsVoice);
    console.log(`[${getDateTime()}] Set IBM Watson TTS voice: ${status ? 'Success' : 'Failed'}`);
    res.status(status ? 200 : 500).send(status ? getTTSVoices() : 'Error');
});

/* Get audio transcript for test audio files */
app.post('/transcript', function (req, res) {
    console.log(`[${getDateTime()}] Fetching transcript for audio file: ${req.body.filename}`);
    const transcript = getTranscript(req.body.filename);
    res.status(200).send(transcript);
});

/* Synthesise audio */
app.post('/synthesize', async function (req, res) {
    console.log(`[${getDateTime()}] Synthesising audio for text: ${req.body.text}`);
    let status = 200;
    const ssml = await convert(req.body.text).then((ssml) => {
        console.log(`[${getDateTime()}] Synthesised SSML: ${ssml.length > 0 ? 'True' : 'False'}`);
        return ssml;
    }).catch((err) => {
        console.log(`[${getDateTime()}] Error: ${err}`);
        status = 500;
        return null;
    });
    if (ssml === null) return res.status(500).send('Error');

    // Synthesise with default voice
    status = await synthesiseAudio(req.body.text, false, ttsVoice)
        .then(() => {
            console.log(`[${getDateTime()}] Success: Standard English Audio synthesised`);
            return 200;
        })
        .catch((err) => console.log(`[${getDateTime()}] Error: ${err}`));

    // Synthesise with dttec influence
    status = await synthesiseAudio(ssml, true, ttsVoice)
        .then(() => {
            console.log(`[${getDateTime()}] Success: DTTEC-influenced Audio synthesised`);
            return 200;
        })
        .catch((err) => console.log(`[${getDateTime()}] Error: ${err}`));

    res.status(status === 200 ? 200 : 500).send(status === 200 ? 'Success' : 'Error');
});


/* Server */
app.listen(process.env.PORT || 8080, function() {
    console.log('Listening on port 8080');
    console.log('----------------------------');
    console.log(`[${getDateTime()}] Server is live at http://${process.env.HOST || 'localhost'}:${process.env.PORT || 8080}`);
});