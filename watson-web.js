const defaultAudioPath  = './audio-gen';
const watsonTTSEndpoint = 'https://api.us-south.text-to-speech.watson.cloud.ibm.com/instances/00200795-4bdf-4ef6-bdee-e43c5f3b2d74';
var token;

async function setIBMCloudToken() {
    await fetch('./api-key.json').then(response => {
        return response.json();
    }).then(data => {
        token = data.token;
        console.log(`WATSON: IBM Cloud API token retrieved successfully`);
    }).catch(err => {
        console.error(`WATSON: Error occured whilst retrieving IBM Cloud API token: ${err.status} - ${err.statusText}`);
    });
}

document.addEventListener("DOMContentLoaded", () => { setIBMCloudToken(); });

let synthesisParams = {
    text: '',
    accept: 'audio/wav',
    voice: 'en-GB_KateV3Voice'
};

/**
 * Retrieves a list of text-to-speech voices.
 * @return {?Array} Array of available voices for text-to-speech or null if an error occurs.
 */
async function getTTSVoices() {
    if (token === undefined) return null;
    const response = await fetch(`https://cors-anywhere.herokuapp.com/${watsonTTSEndpoint}/v1/voices`, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + btoa(`${token}:`),
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        return response.json().result.voices;
    } else {
        return null;
    }
}


/**
 * Set the text-to-speech (TTS) voice to the specified voice.
 * @param {string} voice - The name of the voice to set for TTS.
 * @return {boolean} Returns true if the voice was successfully set, false otherwise.
 */
async function setTTSVoice(voice) { 
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
 * @param {string}  text        The text to be synthesized into speech audio
 * @param {boolean} isSSML      Whether the text is in SSML format
 * @param {string}  voice       The voice to be used for synthesis (default: `en-GB_KateV3Voice`)
 * @param {string}  filename    The name of the audio file
 * @returns 
 */
async function speakText(text, isSSML, voice = synthesisParams.voice, filename) {

    if (!setTTSVoice(voice)) { return false; }
    synthesisParams.text = text;
    console.log(`WATSON: Synthesizing audio using voice: ${synthesisParams.voice}`);
    console.log(`WATSON: Using audio format: ${synthesisParams.accept}`);
    var audio = null;
    
    // Use HTTP request to ask Watson for synthesized audio
    // audio = fetch(`${watsonTTSEndpoint}/v1/synthesize`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Accept': `audio/${synthesisParams.accept}`,
    //         'X-Watson-Learning-Opt-Out': 'true'
    //     },
    //     body: JSON.stringify(synthesisParams)
    // }).then(response => {
    //     return response.blob();
    // }).then(blob => {
    //     var url = window.URL.createObjectURL(blob);
    //     var a = document.createElement('a');
    //     a.href = url;
    //     a.download = `${filename}.${audioFormat}`;
    //     document.body.appendChild(a);
    //     a.click();
    //     setTimeout(() => {
    //         document.body.removeChild(a);
    //         window.URL.revokeObjectURL(url);
    //     }, 100);
    //     return true;
    // }).catch(err => {
    //     console.error(`WATSON: Error occured whilst synthesizing audio: ${err.status} - ${err.statusText}`);
    //     return false;
    // });

    return audio;
}