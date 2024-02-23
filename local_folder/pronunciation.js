const fs = require('fs');
const CryptoJS = require('crypto-js');

//Function used to read the json data from data.json
function readJsonFile(filePath) {
    try {
        // Read the contents of the JSON file synchronously
        const jsonData = fs.readFileSync(filePath, 'utf-8');

        // JSON string to JS Object
        return JSON.parse(jsonData);
    
    } catch (error) {
        console.error(`Error reading JSON file: ${error.message}`);
        return null;
    }
}

//Function extracts the "pronunciation" attribute from the parsed json file data
function getDTTECIPAHashMap(dictPath) {

    let parsedJSON = readJsonFile(dictPath);
    if (!parsedJSON) {
        console.error('Error. No JSON data available.');
    }

    try {
        // Initialize a hashmap to store the "pronunciation" attributes
        let pronunciationMap = new Map();

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
                    pronunciationMap.set(id, pronunciation[0]);
                }
            }
        });

        return pronunciationMap;
    
    } catch (error) {
        console.error(`Error reading and compiling pronunciation attributes: ${error.message}`);
        return null;
    }
}

// Function to lookup entries in the DTTEC HashMap
function lookup(word, dictPath = 'data.json') {
    let hm = getDTTECIPAHashMap(dictPath);
    let hash = CryptoJS.SHA256(word).toString();
    return hm.get(hash) ? hm.get(hash).toString() : undefined;
}

// Export all funtions
module.exports = {
    getDTTECIPAHashMap,
    lookup
};

