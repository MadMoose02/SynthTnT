const ipaToSSML = require('@theresnotime/ipa-to-ssml');
async function convertTextToSSML() {
    try {
      let ssmlResult = await ipaToSSML.convertToSSML();
      console.log('SSML Result:', ssmlResult);
    } catch (error) {
      console.error('Error:', error);
    }
}
  
convertTextToSSML();

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
let sentence = "Hello123, how are you today?";
let words = getWords(removeNonLetters(sentence));
console.log(words);

let hashedWords = hashWords(words);
console.log(hashedWords);
