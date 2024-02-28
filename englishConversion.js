const CryptoJS = require('crypto-js');
const ipa2SSML = require('@theresnotime/ipa-to-ssml');
const Text2IPA = require('text-to-ipa');
const DTTEC    = require('./local_folder/pronunciation.js');


function removeNonLetters(sentence) {
    // Use a regular expression to match anything that is not a letter
    let cleanSentence = sentence.replace(/[^a-zA-Z\s]/g, '');
    return cleanSentence;
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

async function getSESSML(map) {
    let ssmlResults = new Map();
    try {
        for (let [word, ipa] of map.entries()) {
            ssmlResults.set(word, await ipa2SSML.convertToSSML(word, ipa));
        }
        return ssmlResults;
    } catch (error) {
        console.error('Error:', error);
    }
}

if (require.main === module) {
    let sentence = "Is he going to play a game with abir?";
    let seWords = extractStandardEnglish(sentence);
    getSESSML(seWords).then((result) => {
        console.log(result);
    });
}