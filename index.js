import os from 'os';
import multer from 'multer';
import dotenv from 'dotenv';
import express, { response } from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';

import logger from './resources/scripts/logger.js';
import { text2SSML } from './resources/scripts/text2SSML.js';
import { formatDateTime } from './resources/scripts/utils.js';
import GoogleDriveSubmitter from './resources/scripts/storage/googleDrive.js';
import { setAPIKey, setTTSVoice, getTTSVoices,synthesiseAudio } from './resources/scripts/watson-web.js';

/* Check if .env file exists */
if (!existsSync('.env')) {
    logger.error('.env file not found. Core functionality may not work as expected.');
}

/* Load env variables */
dotenv.config();

/* Initialise variables */
let status = 200;
const app = express();
const upload = multer();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routes = __dirname + '/routes/';
const memoryUsage = process.memoryUsage();
const ttsVoice = process.env.IBM_TTS_VOICE || 'en-US_Allison';
const submitter = new GoogleDriveSubmitter(
    process.env.GDRIVE_SERVICE_EMAIL,
    process.env.GDRIVE_PRIVATE_KEY,
    process.env.GDRIVE_FOLDER_ID
);

/* Middlewares */
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

/* Health check */
app.get('/health', function (req, res) {
    logger.info('Health check');
    logger.info(`Memory Usage: RSS=${memoryUsage.rss}, HeapUsed=${memoryUsage.heapUsed}, HeapTotal=${memoryUsage.heapTotal}`);
    res.status(200).send('OK');
});

/* Serve home page */
app.get('/', function (req, res) {
    logger.info('Serving home page');
    res.status(200).sendFile(routes + 'index.html');
});

/* Serve evaluation page */
app.get('/evaluate', function (req, res) {
    logger.info('Serving testing page');
    res.status(200).sendFile(routes + 'evaluation.html');
});

/* Fetch IBM token from environment variable */
app.get('/authorise', function (req, res) {
    setAPIKey(process.env.IBM_TTS_TOKEN);
    status = setTTSVoice(ttsVoice);
    logger.info(`Set IBM Watson TTS voice: ${status ? 'Success' : 'Failed'}`);
    res.status(status ? 200 : 500).send(status ? getTTSVoices() : 'Error');
});

/* Synthesise audio */
app.post('/synthesize', async function (req, res) {
    if (req.body.text.length > 250) {
        return res.status(400).send('Text is longer than the 250 character limit');
    }
    logger.info(`'${req.body.text}' (${req.body.text.length} chars)`);
    status = 200;
    let ssml = await text2SSML(req.body.text);
    logger.info(`${ssml} (${ssml.length} chars)`);

    let ssml_response = null;
    let se_response = null;

    // // Base synthesis
    // se_response = synthesiseAudio(req.body.text, false, ttsVoice);
    // if (se_response.success) {
    //     logger.info('Success: Standard English Audio synthesised');
    //     status = 200;
    // }

    // Synthesise using SSML
    ssml_response = synthesiseAudio(ssml, true, ttsVoice);
    if (ssml_response.success) {
        logger.info('Success: SSML Audio synthesised');
        status = 200;
    }

    // Save SSML and raw text to a transcript file
    const transcriptPath = `./resources/audio/transcripts/${formatDateTime().replace(/:/g, '-')}.json`;
    logger.info(`Saving transcript to: ${transcriptPath}`);
    if (!existsSync(transcriptPath)) {
        mkdirSync(`./resources/audio/transcripts`, { recursive: true });
    }
    writeFileSync(transcriptPath, JSON.stringify({
        text: req.body.text,
        ssml: ssml,
        path: {
            ssml: (ssml_response === null) ? null : ssml_response.path,
            rawtext: (se_response === null) ? null : se_response.path,
        }
    }));

    // // Upload audio to Cloud storage
    // if (se_success) {
    //     let audio = readFileSync(se_path);
    //     await submitter.uploadSynthesizedAudio(audio, se_path.split('/').pop());
    // }
    // if (ssml_success) {
    //     let audio = readFileSync(ssml_path);
    //     await submitter.uploadSynthesizedAudio(audio, ssml_path.split('/').pop());
    // }

    res.status(status).send('Synthesis successful');
});

/* Send evaluation data to Cloud storage */
app.post('/upload', upload.any(), async (req, res) => {
    logger.info('Received evaluation data');
    try {
        let { body, files } = req;
        const timestamp = formatDateTime();
        const filename = `${timestamp}.json`;

        // Build form data into JSON
        body['ip-address'] = req.headers['x-forwarded-for'] || req.headers['remote-addr'] || req.socket.remoteAddress;
        body['timestamp'] = timestamp;
        const formData = JSON.stringify(body);
        logger.info(`Saving data to: ${filename}`);

        // Upload JSON to Google Drive
        await submitter.uploadEvaluationData(body, filename);
        res.status(200).send('Evaluation data successfully submitted');
        logger.info('Evaluation data successfully submitted');

    } catch (err) {
        if (err.response) {
            logger.error(err.response.data.error.message);
            res.status(500).send(err.response.data.error.message);
        } else {
            logger.error(err.message);
            res.status(500).send(err.message);
        }
    }
});

/* Server */
app.listen(process.env.PORT || 8080, async function () {
    const timestamp = formatDateTime();
    const nodeVersion = process.version;
    let yarnVersion = 'Not installed';
    try {
        yarnVersion = execSync('yarn --version').toString().trim();
    } catch (err) {
        logger.warn('Yarn is not installed or not accessible.');
    }

    const osInfo = `${os.type()} ${os.release()} (${os.arch()})`;
    const envInfo = {
        PORT: process.env.PORT || 8080,
        HOST: process.env.HOST || 'localhost',
        IBM_TTS_VOICE: process.env.IBM_TTS_VOICE || 'Not set',
        DTTEC_ENDPOINT: process.env.DTTEC_ENDPOINT || 'Not set',
        DTTEC_PORT: process.env.DTTEC_PORT || 'Not set',
    };

    await logger.writeRaw('=============================================');
    await logger.writeRaw(`# Server started at: ${timestamp}`);
    await logger.writeRaw(`# Node.js version: ${nodeVersion}`);
    await logger.writeRaw(`# Yarn version: ${yarnVersion}`);
    await logger.writeRaw(`# Operating System: ${osInfo}`);
    await logger.writeRaw('# Environment Variables:');
    for (const [key, value] of Object.entries(envInfo)) {
        await logger.writeRaw(`  > ${key}: ${value}`);
    }
    await logger.writeRaw('=============================================\n');
    logger.info(`Server is live at http://${envInfo.HOST}:${envInfo.PORT}`);

    // HEAD request to check if DTTEC is ready
    logger.info(`Sending HEAD request to DTTEC API`);
    fetch(`${envInfo.DTTEC_ENDPOINT}:${envInfo.DTTEC_PORT}`, { method: 'HEAD' })
        .then((response) => {
            logger.info(`DTTEC API is ${response.status === 200 ? 'Ready' : 'Unavailable'}`);
        })
        .catch((err) => logger.error(err.message));
});