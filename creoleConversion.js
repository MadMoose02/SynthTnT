const ipa2SSML = require('@theresnotime/ipa-to-ssml');
const text2IPA = require('text-to-ipa');
const DTTEC = require('./local_folder/pronunciation.js');

function extractCreole(text) {
    let words = text.split(" ");
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
    let words = extractCreole("Ah will take a abricot");
    let creoleSSML = getCreoleSSML(words).then((result) => {
        console.log(result);
    });
}
