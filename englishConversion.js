//const ipaToSSML = require('@theresnotime/ipa-to-ssml');
const pronunciation = require('./local_folder/pronunciation.js');
/*async function convertTextToSSML() {
    try {
      let ssmlResult = await ipaToSSML.convertToSSML();
      console.log('SSML Result:', ssmlResult);
    } catch (error) {
      console.error('Error:', error);
    }
}
  
convertTextToSSML();
*/

// Main program
/*const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter sentence: ', (userInput) => {
  console.log(`You entered: ${userInput}`);
  rl.close();
});
*/

function removeNonLetters(sentence) {
    // Use a regular expression to match anything that is not a letter
    let cleanSentence = sentence.replace(/[^a-zA-Z\s]/g, '');
    return cleanSentence;
}

function getWords(userInput){
    const words = userInput.split(" ");
    return words;
}

function hashWords(words){
    let hashedWords = [];
    for (let i = 0; i < words.length; i++) {
        hashedWords[i] = CryptoJS.SHA256(words[i]).toString();
    }
    
    return hashedWords;
}

const CryptoJS = require('crypto-js');
let sentence = "Is he going to play a game with abir?";
let words = getWords(removeNonLetters(sentence));
console.log(words);

let hashedWords = hashWords(words);

const jsonFilePath = 'data.json';
const jsonData = pronunciation.readJsonFile(jsonFilePath);
const pronunciationMap = pronunciation.extractPronunciationAttribute(jsonData);

for (let i = 0; i < hashedWords.length; i++) {
  const hashedWord = hashedWords[i];

  if (pronunciationMap.hasOwnProperty(hashedWord)) {
    // If the hashed word exists in the map, remove it from both arrays
    hashedWords.splice(i, 1);
    words.splice(i, 1);

    // Adjust the loop index to account for the removed element
    i--;
  }
}









