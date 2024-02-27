const text2IPA = require('text-to-ipa');
const ipa2SSML = require('@theresnotime/ipa-to-ssml');
const DTTEC    = require('./pronunciation.js');


function containsQuestionParticle(sentence) {
    return sentence.includes("?");
}


function removeNonLetters(sentence) {
    return sentence.toString().replace(/[^a-zA-Z\s]/g, '');
}


async function buildSSML(tags, question) {
    let ssml = '<speak xml:lang="en-UK" version="1.1">' + tags.join('');
    return ssml + (question ? "\n    <break time='1s'/> ?" : "") + "\n</speak>";
}


async function convert(text) {
    let isQuestion = containsQuestionParticle(text);
    let words = removeNonLetters(text).split(" ");
    let tags = [];

    for (let i = 0; i < words.length; i++) {
        let word = words[i];

        // Check if the word is in the DTTEC HashMap
        let ipa = DTTEC.lookup(word);
        if (ipa == undefined) {

            // If the word is not in the DTTEC HashMap, use text-to-ipa
            ipa = text2IPA.lookup(word);
            ipa = (ipa.error == 'multi') ? ipa.text.split(" OR ")[0] : ipa.text;
        }
        // console.log(ipa);

        // Convert the IPA and build SSML string
        await ipa2SSML.convertToSSML(word, ipa).then((result) => {
            tags.push(`\n    <phoneme ${result.split("<phoneme ")[1].split("</phoneme>")[0]}</phoneme>`);
        });
    }

    return await buildSSML(tags, isQuestion);
}


function main() {
    let sentence = "Is he going to play a game with abir?";
    convert(sentence).then((_) => console.log(_));
}


module.exports = {
    convert
};


if (require.main === module) {
    main();
}