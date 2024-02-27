const ipa2SSML = require('@theresnotime/ipa-to-ssml');
const Text2IPA = require('text-to-ipa');
const DTTEC    = require('./pronunciation.js');


function removeNonLetters(sentence) {
    return sentence.toString().replace(/[^a-zA-Z\s]/g, '');
}

function extractStandardEnglish(text){
    let words = removeNonLetters(text).split(" ");
    let seWords = new Map();

    // Remove any words that are in the DTTEC HashMap
    for (let i = 0; i < words.length; i++) {
        let word = words[i];
    
        // Words found in the DTTEC HashMap are skipped
        if (DTTEC.lookup(word)) { continue; }

        // Add the word to the map
        let ipa = Text2IPA.lookup(word);
        (ipa.error == 'multi') ? 
            seWords.set(word, ipa.text.split(" OR ")[0]) :
            seWords.set(word, ipa.text);
    }
    return seWords;
}

async function getSESSML(text) {
    let ssmlResults = new Map();
    try {
        // For each entry in the Standard English word map
        for (let [word, ipa] of extractStandardEnglish(text).entries()) {

            // Store the converted SSML with the word as the key
            ssmlResults.set(word, await ipa2SSML.convertToSSML(word, ipa));
        }
        return ssmlResults;
    } catch (error) {
        console.error('Error:', error);
    }
}

module.exports = {
    getSESSML
};

if (require.main === module) {
    let sentence = "Is he going to play a game with abir?";
    getSESSML(sentence).then((result) => {
        console.log(result);
    });
}