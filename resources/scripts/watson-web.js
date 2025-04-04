import fs from 'fs';
import dotenv from 'dotenv';
import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';

import logger from './logger.js';
import { formatDateTime } from './utils.js';

dotenv.config();

/* Constants */
const defaultOutputPath = './resources/audio';
const watsonTTSEndpoint = 'https://api.us-south.text-to-speech.watson.cloud.ibm.com/'

/* Synthesis parameters */
let synthesisParams = {
    text: '',
    accept: 'audio/wav',
    voice: 'en-GB_KateV3Voice'
};

/* IBM TextToSpeechV1 object */
let textToSpeech = null;


/**
 * Sets the IBM Cloud TTS API key.
 * 
 * @param {String} key The IBM Cloud TTS API key to use with IBM Watson
 */
export function setAPIKey(key) {
    textToSpeech = new TextToSpeechV1({
        authenticator: new IamAuthenticator({ apikey: key }),
        serviceUrl: watsonTTSEndpoint,
        accept: synthesisParams.accept
    });
}


/**
 * Retrieves a list of text-to-speech voices.
 * 
 * @return {?Array<String>} Array of available voices for text-to-speech or null if an error occurs.
 */
export async function getTTSVoices() {
    if (textToSpeech === null) return null;
    let x = await textToSpeech.listVoices().then(result => {
        return result.result.voices;
    }).catch(err => {
        logger.error(`[WATSON-WEB] Unable to retrieve list of voices due to error: ${err.status} - ${err.statusText}`);
        return null;
    });
    return x;
}


/**
 * Set the text-to-speech (TTS) voice to the specified voice.
 * 
 * @param {string} voice - The name of the voice to set for TTS.
 * @return {boolean} Returns true if the voice was successfully set, false otherwise.
 */
export async function setTTSVoice(voice) { 
    await getTTSVoices().then(voices => {
        if (voices === null) return false;
        for (let v of voices) {
            if (v.name !== voice) continue;
            synthesisParams.voice = voice;
            logger.info(`[WATSON-WEB] Synthesis voice set to '${synthesisParams.voice}'`);
            return true;
        }
    });
    return true;
}


/**
 * This function synthesizes input text into speech audio using the IBM Watson Text-to-Speech service.
 * 
 * @param {string}  text        The text to be synthesized into speech audio
 * @param {boolean} isSSML      Whether the text is in SSML format
 * @param {string}  voice       The voice to be used for synthesis (default: `en-GB_KateV3Voice`)
 * @param {string}  outputPath  The path where the audio file should be stored
 * @param {string}  filename    The name of the audio file
 * @param {string}  audioFormat The format of the audio file (default: `wav`)
 * @returns {boolean, string}   Returns true and the path to the audio file if successful, false otherwise.
 */
export async function synthesiseAudio(
    text, 
    isSSML      = false,
    voice       = synthesisParams.voice, 
    outputPath  = defaultOutputPath,
    filename    = formatDateTime().replace(/:/g, '-'),
    audioFormat = 'wav') {

    if (!setTTSVoice(voice)) { 
        logger.warn(`[WATSON-WEB] Unable to set voice to '${voice}'. Using default voice '${synthesisParams.voice}'`);
    }
    synthesisParams.text = text;
    synthesisParams.accept = `audio/${audioFormat}`;
    logger.info(`[WATSON-WEB] Using audio format: ${synthesisParams.accept}`);
    
    // Check for output path. Create it if not exists
    if (!fs.existsSync(outputPath)) { fs.mkdirSync(outputPath); }

    // Use TextToSpeechV1 to synthesize audio
    let response = await textToSpeech.synthesize(synthesisParams)
        .then(response => {
            logger.info(`[WATSON-WEB] Synthesis response: ${response.status} - ${response.statusText}`);
            return (synthesisParams.accept === 'audio/wav') ? 
                textToSpeech.repairWavHeaderStream(response.result) : response.result;
        })
        .then(buffer => {
            outputPath += (isSSML) ? '/ssml' : '/rawtext';
            if (!fs.existsSync(outputPath)) { fs.mkdirSync(outputPath); }
            outputPath += `/${filename}.${audioFormat}`;
            fs.writeFileSync(outputPath, buffer);
            logger.info(`[WATSON-WEB] Audio file saved to: ${outputPath}`);
            return true;
        })
        .catch(err => {
            logger.error(`[WATSON-WEB] Error occurred during synthesis: ${err.status} - ${err.message}`);
            return false;
        });

    return { success: response, path: outputPath };
}
