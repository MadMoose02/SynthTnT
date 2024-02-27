const text2IPA = require('text-to-ipa');
const ipa2SSML = require('@theresnotime/ipa-to-ssml');
const DTTEC    = require('./pronunciation.js');


function containsQuestionParticle(sentence) {
    return sentence.includes("?");
}


function removePunctuation(sentence) {
    return sentence.toString().replace(/[^a-zA-Z\s]/g, '');
}


async function buildSSML(tags, question) {
    let ssml = '<p><s>' + tags.join(' ');
    return ssml + (question ? "?" : "") + "</s></p>";
}


async function convert(text) {
    let isQuestion = containsQuestionParticle(text);
    let tags = [];

    while (text.length > 0) {
        let word = text.split(' ')[0];
        let ipa = DTTEC.lookup(removePunctuation(word.toLowerCase()));
        if (ipa !== undefined) {

            // Convert ipa to ssml and push into tags
            await ipa2SSML.convertToSSML(word, ipa).then((ssml) => {
                ssml = '<phoneme' + ssml.split('<phoneme')[1].split('</phoneme>')[0] + '</phoneme>';
                tags.push(ssml);
            });
        
        } else { tags.push(word); }

        // Remove word from the text
        text = text.replace(word, '', 1).replace(' ', '', 1);
    }

    return await buildSSML(tags, isQuestion);
}


function main() {
    let sentence = "Hey, it have a Phagwa celebration today";
    convert(sentence).then((_) => console.log(`\nFinal SSML: ${_}`));
}


module.exports = {
    convert
};


if (require.main === module) {
    main();
}