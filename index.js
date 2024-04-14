import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import { PassThrough } from 'stream';
import { convert } from './scripts/text2SSML.js';
import { setAPIKey, getTTSVoices, setTTSVoice, synthesiseAudio } from './scripts/watson-web.js';

/* Check if .env file exists */
if (!fs.existsSync('.env')) {
    console.error('ERROR: .env file not found. Core functionality may not work as expected.');
}

/* Load env variables */
dotenv.config();

const app = express();
const upload = multer();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = __dirname + '/routes/';
const ttsVoice = process.env.IBM_TTS_VOICE || 'en-US_Allison';
const jwtClient = new google.auth.JWT(
    "synthtnt-evaluation@synthtnt.iam.gserviceaccount.com",
    null,
    process.env.PRIVATE_KEY,
    ['https://www.googleapis.com/auth/drive'],
    null
);
jwtClient.authorize(function (err, tokens) {
    if (err) { console.log(err); return; } 
    else { console.log(`[${getDateTime()}] Successfully connected to Google Drive`); }
});


/* Middlewares */
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));


/**
 * This code defines an asynchronous function uploadFile that uploads a file to Google Drive. 
 * It reads the file content from fileObject.buffer, sets the file metadata and then sends 
 * the file to Google Drive using the Google Drive API.
 * 
 * @param {*} fileObject The form data of the uploaded file 
 */
const uploadFile = async (fileObject) => {
    // Upload file to Google Drive
    const bufferStream = new PassThrough();
    bufferStream.end(fileObject.buffer);
    await google.drive({ version: 'v3', auth: jwtClient }).files.create({
        token: process.env.GOOGLE_TOKEN,
        media: {
            mimeType: fileObject.mimeType,
            body: bufferStream,
        },
        requestBody: {
            name: fileObject.originalname,
            parents: [process.env.GDRIVE_FOLDER_ID],
        },
        fields: 'id,name',
    });
    console.log(`[${getDateTime()}] Uploaded file to SynthTnT evaluation storage`);
};

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
    return `${year}-${month}-${day} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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

/* Serve evaluation page */
app.get('/evaluate', function (req, res) {
    console.log(`[${getDateTime()}] Serving testing page`)
    res.status(200).sendFile(baseDir + 'evaluation.html');
});

/* Fetch IBM token from environment variable */
app.get('/authorise', function (req, res) {
    let status = setAPIKey(process.env.IBM_TTS_TOKEN);
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
    if (req.body.text.length > 50) return res.status(400).send('Text is longer than the 50 character limit');
    console.log(`[${getDateTime()}] Synthesising audio for text: ${req.body.text}`);
    let status = 200;
    const ssml = await convert(req.body.text).then((ssml) => {
        console.log(`[${getDateTime()}] Synthesised SSML: ${ssml.length > 0 ? 'True' : 'False'}`);
        return ssml;
    });
    if (ssml === null) {
        console.log(`[${getDateTime()}] SSML conversion failed`);
        return res.status(500).send('Core failure: SSML conversion failed');
    }

    // Synthesise with default voice
    status = await synthesiseAudio(req.body.text, false, ttsVoice)
        .then(() => {
            console.log(`[${getDateTime()}] Success: Standard English Audio synthesised`);
            return 200;
        })
        .catch((err) => console.log(`[${getDateTime()}] ${err}`));

    // Synthesise with dttec influence
    status = await synthesiseAudio(ssml, true, ttsVoice)
        .then(() => {
            console.log(`[${getDateTime()}] Success: DTTEC-influenced Audio synthesised`);
            return 200;
        })
        .catch((err) => console.log(`[${getDateTime()}] ${err}`));

    res.status(status === 200 ? 200 : 500).send(status === 200 ? 'Success' : 'Error');
});

/* Upload form data to Google Drive */
app.post('/upload', upload.any(), async (req, res) => {
    console.log(`[${getDateTime()}] Received evaluation data`);
    try {
        let { body, files } = req;
        const now       = new Date();
        const timestamp = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
        const filename  = `eval-${timestamp}.json`;
        
        // Build form data into JSON
        body['ip-address'] = req.ip || req.headers['x-forwarded-for'];
        body['timestamp'] = getDateTime();
        const formData = JSON.stringify(body);
        console.log(`[${getDateTime()}] Saving data to: ${filename}`);

        // Upload JSON to Google Drive
        await uploadFile({ buffer: formData, originalname: filename, mimeType: 'application/json' });
        res.status(200).send('Evaluation data successfully submitted');

    } catch (err) {
        if (err.response) {
            console.log(`[${getDateTime()}] ${err.response.data.error.message}`);
            res.status(500).send(err.response.data.error.message);
        } else {
            console.log(`[${getDateTime()}] ${err}`);
            res.status(500).send(`${err}`);
        }
    }
});


/* Server */
app.listen(process.env.PORT || 8080, function() {
    console.log('Listening on port 8080');
    console.log('----------------------------');
    console.log(`[${getDateTime()}] Server is live at http://${process.env.HOST || 'localhost'}:${process.env.PORT || 8080}`);
    console.log(`[${getDateTime()}] Fetching DTTEC API ...`);

    // Send HEAD to check if API is ready
    fetch(process.env.DTTEC_ENDPOINT, { method: 'HEAD' })
        .then((response) => {
            console.log(`[${getDateTime()}] DTTEC API: ${response.status === 200 ? 'Ready' : 'Unavailable'}`);
        })
        .catch((err) => console.log(`[${getDateTime()}] ${err}`));
});