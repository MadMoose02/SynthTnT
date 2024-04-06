import { toIPA } from 'arpabet-and-ipa-convertor-t';
const ipa2SSML = require('@theresnotime/ipa-to-ssml');
const DTTEC    = require('./pronunciation.js');

function removeNonLetters(sentence) {
    return sentence.toString().replace(/[^a-zA-Z\s]/g, '');
}

function extractCreole(text) {
    let words = removeNonLetters(text).split(" ");
    let creoleWords = new Map();

    for (let i = 0; i < words.length; i++) {

        // Check if the word is in the DTTEC HashMap and store the Arpabet
        let arpabet = DTTEC.lookup(words[i]);

        // If the word is in DTTEC, convert to IPA and add to the map. Otherwise, skip
        if (arpabet == undefined) continue;
        ipa = toIPA(arpabet);   // Convert the ARPAbet to IPA
        creoleWords.set(words[i], ipa);
    }
    return creoleWords;
}

async function getCreoleSSML(text) {
    let ssmlResults = new Map();
    try {
        // For each entry in the Creole English word map
        for (let [word, ipa] of extractCreole(text).entries()) {

            // Store the converted SSML with the word as the key
            ssmlResults.set(word, await ipa2SSML.convertToSSML(word, ipa));
        }
        return ssmlResults;
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    getCreoleSSML
};

if (require.main === module) {
    let sentence = "Is he going to play a game with abir?";
    getCreoleSSML(sentence).then((result) => {
        console.log(result);
    });
}
