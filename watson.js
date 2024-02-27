const fs                   = require('fs');
const token                = require('./api-key.json')['access-token'];
const { exec }             = require('child_process');
const TextToSpeechV1       = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const outputPath           = './audio-gen';
// const watsonTTSEndpoint    = 'https://api.us-south.text-to-speech.watson.cloud.ibm.com/instances/264b490d-905e-46e4-b667-f4b043a16308';
const watsonTTSEndpoint    = 'https://api.us-south.text-to-speech.watson.cloud.ibm.com/'

let synthesisParams = {
    text: '',
    accept: 'audio/wav',
    voice: 'en-GB_KateV3Voice'
};
let textToSpeech = new TextToSpeechV1({
    authenticator: new IamAuthenticator({
        apikey: `${token}`
    }),
    serviceUrl: `${watsonTTSEndpoint}`,
    accept: `${synthesisParams.accept}`
});


// Functions

async function getTTSVoices() {
    let x = await textToSpeech.listVoices().then(result => {
        return result.result.voices;
    }).catch(err => {
        console.error(`WATSON: Error occured whilst retrieving list of voices: ${err.status} - ${err.statusText}`);
        return null;
    });
    return x;
}

async function setTTSVoice(voice) { 
    await getTTSVoices().then(voices => {
        if (voices === null) return false;
        for (let _ of voices) {
            if (_.name === voice) {
                synthesisParams.voice = voice;
                return true;
            }
        };

        console.log(`WATSON: Voice '${voice}' not found. Try invoking get_tts_voices() to get a list of available voices.`);
        console.log(`WATSON: Using default voice '${synthesisParams.voice}'`);
    })
    return true;
}

function playAudio(audioPath) {
    let ifs = fs.createReadStream(audioPath);
    try { exec(`start ${audioPath}`); } 
    catch (err) { console.error(`WATSON: Error playing audio. Try manually playing ${audioPath}`); } 
    finally { ifs.close(); }
    return true;
}

async function speakText(text, 
                         isSSML = false,
                         voice = synthesisParams.voice, 
                         filename = `watson-tts`, 
                         audioFormat = `wav`) {

    if (!setTTSVoice(voice)) { return false; }
    console.log(`WATSON: Synthesizing audio using voice: ${voice}`);
    synthesisParams.text = text;
    synthesisParams.accept = `audio/${audioFormat}`;
    console.log(`WATSON: Using audio format: ${synthesisParams.accept}`);
    
    // Check for output path
    if (!fs.existsSync(outputPath)) { fs.mkdirSync(outputPath); }

    // Use TextToSpeechV1 to synthesize audio
    let status = await textToSpeech.synthesize(synthesisParams)
        .then(response => {
            console.log(`WATSON: Speech audio synthesis successful`);
            
            // Use repairWavHeaderStream only for wav formats; otherwise, pipe `response.result` to ofstream
            return (synthesisParams.accept === 'audio/wav') ? 
                textToSpeech.repairWavHeaderStream(response.result) : response.result;
        }).then(buffer => {
            filename += `${(isSSML ? '-ssml' : '')}-${Date.now()}`
            fs.writeFileSync(`${outputPath}/${filename}.${audioFormat}`, buffer);
            console.log(`WATSON: Synthesised audio written to file: ${outputPath}/${filename}.${audioFormat}`);
            return true;
        }).catch(err => {
            console.error(`WATSON: Error occurred while synthesizing audio: ${err.status} - ${err.message}\n`);
            return false;
        });

    // Play synthesized audio
    if (!status) { return false; }
    console.log(`WATSON: Playing synthesised speech audio...`);
    playAudio(`${outputPath}/${filename}.${audioFormat}`);
}

module.exports = {
    getTTSVoices,
    setTTSVoice,
    speakText
};

// Command line interface

if (require.main === module) {
    const text = process.argv[2];
    if (!text) { 
        console.error('\nError: No text input supplied');
        console.log('Usage: node watson.js <text>'); 
        return;
    }
    speakText(text);
}