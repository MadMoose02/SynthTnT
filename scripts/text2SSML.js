let DTTECEndpoint = `https://dttec-api.onrender.com/get-pronunciation`;
let defaultXML = `
<?xml version="1.0"?>
<speak version="1.1"
    xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.w3.org/2001/10/synthesis
        http://www.w3.org/TR/speech-synthesis11/synthesis.xsd"
    xml:lang="en-US">
    <phoneme alphabet="ipa" ph="{{{ipa}}}">{{{word}}}</phoneme>
</speak>`;

/**
 * This function converts the input word to SSML
 * @param {string} word The word to convert into an SSML string
 * @param {string} ipa The pronunciation of the word in IPA notation
 * @returns 
 */
async function convertToSSML(word, ipa) {
    try { return defaultXML.replaceAll('{{{word}}}', word).replaceAll('{{{ipa}}}', ipa); } 
    catch (err) { return err; }
}

/**
 * This function iteratively converts each word in the input sentence to SSML. If a word
 * is not found in the DTTEC dictionary (queried via the API), they will be returned as-is.
 * @param {string} text The sentence to convert to SSML
 * @returns The SSML string
 */
export async function convert(text) {
    let isQuestion = text.includes("?");
    text = text.toLowerCase().replace(/[^a-zA-Z\s]/g, '');
    let tags = [];

    while (text.length > 0) {
        let word = text.split(' ')[0];

        // Check if the word is in the DTTEC dictionary
        let response = await fetch(`https://dttec-api.onrender.com/get-pronunciation/${word}`)
            .then((response) => response.text())
            .then((data) => JSON.parse(data));
        
        // Only push the word if it is in the DTTEC dictionary
        if (response.status === 'OK') {

            // Convert ipa to ssml and push into tags
            await convertToSSML(word, response.pronunciation).then((ssml) => {
                ssml = '<phoneme' + ssml.split('<phoneme')[1].split('</phoneme>')[0] + '</phoneme>';
                tags.push(ssml);
            });
        
        } else { tags.push(word); }

        // Remove word from the text and continue to next word
        text = text.replace(word, '', 1).replace(' ', '', 1);
    }

    return '<p><s>' + tags.join(' ') + (isQuestion ? "?" : "") + "</s></p>";
}

// Command line (Node.js)
// if (require.main === module) {
//     let sentence = "Hey, it have a Phagwa celebration today";
//     // convert(sentence).then((_) => console.log(`\nFinal SSML: ${_}`));
//     convert(sentence);
// }