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

    let parsedJSON = readJsonFile(dictPath);
    if (!parsedJSON) {
        console.error('Error. No JSON data available.');
    }

    try {

        // Iterate over the JSON data and build the hashmap
        parsedJSON.forEach(entry => {
        
            // Use the 'headword' attribute as the key 
            let id = CryptoJS.SHA256(entry.headword).toString();
            
            // Extract the 'pronunciation' attribute
            let pronunciation = entry.pronunciation;
            
            // Check if the 'pronunciation' attribute is defined
            if (pronunciation != '') {

                // Add only words that have a pronunciation
                if (pronunciation.length > 0){

                    // Add the 'pronunciation' attribute to the array
                    DTTECIPAHashMap.set(id, pronunciation[0]);
                }
            }
        });
        console.log(`Loaded ${DTTECIPAHashMap.size} entries from ${dictPath}`);
    
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