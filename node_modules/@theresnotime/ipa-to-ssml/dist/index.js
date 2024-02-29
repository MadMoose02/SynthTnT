const fs = require('fs/promises');
const {XMLValidator} = require('fast-xml-parser');

/**
 * Convert IPA to SSML
 * @param {string} word - The word represented by the IPA.
 * @param {string} ipa - The IPA representation of the word.
 * @param {string} variant - Which SSML variant to use. Defaults to 'default'.
 */
async function convertToSSML(word, ipa, variant = 'default') {
    let requestedVariant = __dirname + '/templates/' + variant + '.xml';

    try {
        let data = await fs.readFile(requestedVariant, { encoding: 'utf8' });
        if(data) {
            data = data.replaceAll('{{{word}}}', word);
            data = data.replaceAll('{{{ipa}}}', ipa);
    
            if(validateSSML(data)) {
                return data;
            } else {
                throw new Error('Generated SSML is invalid');
            }
        } else {
            throw new Error('Could not read file - unknown variant');
        }
    } catch (err) {
        return err;
    }
}

/**
 * Validate SSML
 * @param {string} ssml - SSML to validate.
 * @returns {boolean} - Whether the SSML is valid.
 */
function validateSSML(ssml) {
    try {
        const result = XMLValidator.validate(
            ssml,
            {
                allowBooleanAttributes: true
            }
        );

        if(result !== true) {
            throw new Error('Generated SSML is invalid');
        } else {
            return result;
        }
    } catch (err) {
        return err;
    }
}

module.exports = {
    convertToSSML,
    validateSSML
};