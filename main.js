const text2SSML = require('./text2SSML');
const IBM       = require('./watson');

async function main() {
    let sentence = "Let we go celebrate Diwali!";
    let ssml = await text2SSML.convert(sentence);
    console.log("SSML (TTE/C):\n" + ssml);
    await IBM.speakText(ssml, "en-GB_KateV3Voice", 'watson-tts-ssml');
}

main();