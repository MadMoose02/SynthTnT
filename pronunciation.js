const fs = require('fs');
const CryptoJS = require('crypto-js');

var DTTECIPAHashMap = new Map();
loadDTTECIPAHashMap();

//Function used to read the json data from data.json
function readJsonFile(filePath) {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf-8');

        // Check if the JSON data is valid
        if (jsonData === '') {
            console.error('Error. No JSON data available.');
            return null;
        }

        // JSON string to JS Object
        return JSON.parse(jsonData);
    
    } catch (error) {
        console.error(`Error reading JSON file: ${error.message}`);
        return null;
    }
}

//Function extracts the "pronunciation" attribute from the parsed json file data
function loadDTTECIPAHashMap(dictPath = 'DTTEC_FULL.json') {
    console.log('DTTEC: Using ' + dictPath);
    let parsedJSON = readJsonFile(dictPath);
    if (!parsedJSON) {
        console.error('Error. No JSON data available.');
    }

    try {

        // Iterate over the JSON data and build the hashmap
        parsedJSON.forEach(entry => {
        
            // Use the 'headword' attribute as the key 
            let id = CryptoJS.SHA256(entry.headword.toLowerCase()).toString();
            
            // Extract the 'pronunciation' attribute
            let pronunciation = entry.pronunciation;
            
            // Check if the 'pronunciation' attribute is defined and add to the array
            if (pronunciation.length > 0) {
                DTTECIPAHashMap.set(id, pronunciation[0]);

                // Also add the alternate spellings as separate entries
                for (let i = 0; i < entry.alternate_spelling.length; i++) {
                    id = CryptoJS.SHA256(entry.alternate_spelling[i].toLowerCase()).toString();
                    DTTECIPAHashMap.set(id, pronunciation[0]);
                }
            }
        });
        console.log(`DTTEC: Loaded ${DTTECIPAHashMap.size} entries from ${dictPath}`);
    
    } catch (error) {
        console.error(`Error reading and compiling pronunciation attributes: ${error.message}`);
        return null;
    }
}

// Function to lookup entries in the DTTEC HashMap
function lookup(word) {
    let hash = CryptoJS.SHA256(word).toString();
    return DTTECIPAHashMap.get(hash) ? DTTECIPAHashMap.get(hash).toString() : undefined;
}

// Export all funtions
module.exports = {
    loadDTTECIPAHashMap,
    lookup
};