import fs from 'fs';
import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
const defaultOutputPath = './audio-gen';
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
    return true;
}


/**
 * Retrieves a list of text-to-speech voices.
 * 
 * @return {?Array<String>} Array of available voices for text-to-speech or null if an error occurs.
 */
export async function getTTSVoices() {
    let x = await textToSpeech.listVoices().then(result => {
        return result.result.voices;
    }).catch(err => {
        console.error(`WATSON: Error occured whilst retrieving list of voices: ${err.status} - ${err.statusText}`);
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
            return true;
        }
        console.log(`WATSON: Voice '${voice}' not found. Try invoking get_tts_voices() to get a list of available voices.`);
        console.log(`WATSON: Using default voice '${synthesisParams.voice}'`);
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
 * @returns 
 */
export async function synthesiseAudio(
    text, 
    isSSML      = false,
    voice       = synthesisParams.voice, 
    outputPath  = defaultOutputPath,
    filename    = `watson-tts`, 
    audioFormat = `wav`) {

    if (!setTTSVoice(voice)) { return false; }
    console.log(`WATSON: Synthesizing audio using voice: ${voice}`);
    synthesisParams.text = text;
    synthesisParams.accept = `audio/${audioFormat}`;
    console.log(`WATSON: Using audio format: ${synthesisParams.accept}`);
    
    // Check for output path
    if (!fs.existsSync(outputPath)) { fs.mkdirSync(outputPath); }

    // Use TextToSpeechV1 to synthesize audio
    let response = await textToSpeech.synthesize(synthesisParams)
        .then(response => {
            console.log(`WATSON: Speech audio synthesis successful`);
            
            // Use repairWavHeaderStream only for wav formats; otherwise, pipe `response.result` to ofstream
            return (synthesisParams.accept === 'audio/wav') ? 
                textToSpeech.repairWavHeaderStream(response.result) : response.result;
        }).then(buffer => {
            filename += `${(isSSML ? '-ssml' : '')}`
            fs.writeFileSync(`${outputPath}/${filename}.${audioFormat}`, buffer);
            console.log(`WATSON: Synthesised audio written to file: ${outputPath}/${filename}.${audioFormat}`);
            return true;
        }).catch(err => {
            console.error(`WATSON: Error occurred while synthesizing audio: ${err.status} - ${err.message}\n`);
            return false;
        });

    return response.status === 200;
}
