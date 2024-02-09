//Function used to read the json data from data.json
function readJsonFile(filePath) {
  try {
    // Read the contents of the JSON file synchronously
    const jsonData = fs.readFileSync(filePath, 'utf-8');

    // JSON string to JS Object
    return JSON.parse(jsonData);
  } 
  catch (error) {
    console.error(`Error reading JSON file: ${error.message}`);
    return null;
  }
}

//Function extracts the "pronunciation" attribute from the parsed json file data
function extractPronunciationAttribute(parsedData) {
  try {
    // Initialize a hashmap to store the "pronunciation" attributes
    const pronunciationMap = {};

    // Keeps count of the number of pronunciation attributes found from the parsed file.
    // This equates to the number of words present in the file.
    numWords = 0;

    // Iterate over the JSON data and build the hashmap
    parsedData.forEach(entry => {
    
      // Use the 'entry_id' attribute as the key 
      const uniqueId = entry.entry_id;
      // Extract the 'pronunciation' attribute
      const pronunciation = entry.pronunciation;

      // Check if the 'pronunciation' attribute is defined
      if (pronunciation !== undefined) {
        // Initialize an array for the unique identifier if not already present
        if (!pronunciationMap[uniqueId]) {
          pronunciationMap[uniqueId] = [];
        }

        // Add the 'pronunciation' attribute to the array
        pronunciationMap[uniqueId].push(pronunciation);
        numWords = 1 + numWords;
      }
    });

    console.log('Number of Words Found:', numWords);
    return pronunciationMap;
  } 
  catch (error) {
    console.error(`Error reading and compiling pronunciation attributes: ${error.message}`);
    return null;
  }
}


//Main Program 
const fs = require('fs');
const jsonFilePath = 'data.json';

const jsonData = readJsonFile(jsonFilePath);

if (jsonData) {
  //console.log('JSON data:', jsonData);
  
  const pronunciationMap = extractPronunciationAttribute(jsonData);

  if (pronunciationMap) {
    console.log('Pronunciation Map:', pronunciationMap);
  }
}
else {
  console.log('Error. No JSON data available.');
}
