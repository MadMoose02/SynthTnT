const ipa2SSML = require('@theresnotime/ipa-to-ssml');
const DTTEC    = require('./local_folder/pronunciation.js');

function removeNonLetters(sentence) {
    // Use a regular expression to match anything that is not a letter
    let cleanSentence = sentence.replace(/[^a-zA-Z\s]/g, '');
    return cleanSentence;
}

function extractCreole(text) {
    let words = removeNonLetters(text).split(" ");
    let creoleWords = new Map();
    for (let i = 0; i < words.length; i++) {
        let ipa = DTTEC.lookup(words[i]);
        if (ipa == undefined) continue;
        creoleWords.set(words[i], ipa);
    }
    return creoleWords;
}

async function getCreoleSSML(map) {
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
    let words = extractCreole(sentence);
    getCreoleSSML(words).then((result) => {
        console.log(result);
    });
}
