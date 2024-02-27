async function main() {
    const {readFileSync} = require('fs');
    const text2SSML = require('./text2SSML');
    const DTTEC = require('./pronunciation');
    const ipa2SSML = require('@theresnotime/ipa-to-ssml');
    const IBM = require('./watson');

    let sentence = "Hey, there's a phagwa celebration today";
    // let sentence = "tomato";
    // let ssml = readFileSync('./test-ssml.xml', 'utf8');
    let ssml = await text2SSML.convert(sentence);

    console.log("SSML (TTE/C):\n" + ssml);
    await IBM.speakText(ssml, true);
}


if (require.main === module) {
    console.clear();
    main();
}