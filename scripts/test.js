async function main() {
    const text2SSML = require('./text2SSML');
    const IBM = require('./watson');

    let sentence = "Ah ketch a vap the other day";
    let ssml = await text2SSML.convert(sentence);
    console.log("SSML (TTE/C):\n" + ssml);

    // await IBM.speakText(sentence); // pure BRIT ENG synthesis
    await IBM.speakText(ssml, true); // synthesis with DTTEC influence
}

if (require.main === module) {
    console.clear();
    main();
}