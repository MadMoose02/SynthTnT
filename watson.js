const TextToSpeechV1 = require('ibm-watson/text-to-speech/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const watsonTTSEndpoint = 'https://api.us-south.text-to-speech.watson.cloud.ibm.com';
const fs = require('fs');
const token = require('./api-key.json')['acces-token'];   // supply Waston API key in api-key.json
const outputPath = './audio-gen';

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

module.exports = {
    getTTSVoices,
    speakText
};


// Functions

async function getTTSVoices() {
    let x = await textToSpeech.listVoices().then(result => {
        return result.result.voices;
    }).catch(err => {
        console.log(`Error occured whilst retrieving list of voices: ${err.status} - ${err.statusText}`);
        return null;
    });
    return x;
}

async function setTTSVoice(voice) { 
    await getTTSVoices().then(voices => {
        if (!voices) { 
            console.log('Error occurred trying to retrieve list of voices');
            return false; 
        }

        for (let _ of voices) {
            if (_.name === voice) {
                synthesisParams.voice = voice;
                return true;
            }
        };

        console.log(`Voice '${voice}' not found. Try invoking get_tts_voices() to get a list of available voices.`);
    })
    return false;
}

function playAudio(audioPath) {
    const {exec} = require('child_process');
    let ifs = fs.createReadStream(audioPath);
    try { exec(`start ${audioPath}`); } 
    catch (err) { console.log(`Error playing audio: ${err}`); } 
    finally { ifs.close(); }
    return true;
}

async function speakText(voice, text, filename, audioFormat) {
    if (!setTTSVoice(voice)) { return false; }
    console.log(`Synthesizing audio using voice: ${voice}`);
    synthesisParams.text = text;
    synthesisParams.accept = `audio/${audioFormat}`;
    console.log(`Using audio format: ${synthesisParams.accept}`);

    // Check for output path
    if (!fs.existsSync(outputPath)) { fs.mkdirSync(outputPath); }

    // Use TextToSpeechV1 to synthesize audio
    await textToSpeech.synthesize(synthesisParams)
        .then(response => {
            console.log(`Speech audio synthesis successful`);
            
            // Use repairWavHeaderStream only for wav formats; otherwise, pipe `response.result` to ofstream
            return (synthesisParams.accept === 'audio/wav') ? 
                textToSpeech.repairWavHeaderStream(response.result) : response.result;
        }).then(buffer => {
            fs.writeFileSync(`${outputPath}/${filename}.${audioFormat}`, buffer);
            console.log(`Synthesised audio written to file: ${outputPath}/${filename}.${audioFormat}`);
        }).catch(err => {
            console.log(`Error occurred while synthesizing audio: ${err.status} - ${err.statusText}`);
            return false;
        });

    // Play synthesized audio
    console.log(`Playing synthesised speech audio...`);
    playAudio(`${outputPath}/${filename}.${audioFormat}`);
    console.log(`Process complete.`);
}


// Command line interface

if (require.main === module) {
    const text = process.argv[2];
    if (!text) { 
        console.error('\nError: No text input supplied');
        console.log('Usage: node watson.js <text>'); 
        return;
    }
    speakText('en-GB_KateV3Voice', text, 'test-audio', 'wav');
}