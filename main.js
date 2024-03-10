// Store the count of how often words appear together
let wordPairsFrequency = {};

// Listen for clicks on the analyze button
document.getElementById('analyzeButton').addEventListener('click', analyzeText);

// Function to analyze the text
function analyzeText() {
    // Get the text the user entered
    const text = document.getElementById('textInput').value;

    // Get the number chosen by the user
    const nValue = parseInt(document.getElementById('nValue').value);

    // Call a function to count word pairs and show the results
    generateNGrams(text, nValue);
}

// Function to preprocess the text
function preprocessText(text) {
    // Convert the text to lowercase and extract words
    return text.toLowerCase().match(/\b\w+\b/g);
}

// Function to split the text into sentences
function splitIntoSentences(text) {
    // Split the text into sentences based on periods and remove empty sentences
    return text.split('.').filter(sentence => sentence.trim() !== '');
}

// Function to count word pairs
function generateNGrams(text, n) {
    // Fetch the text file and check its content
    fetch('Book/under_the_desert_stars.txt')
        .then(response => {
            // Check if we got the text correctly
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text(); // Get the text
        })
        .then(text => {
            // Split the text into sentences
            const sentences = splitIntoSentences(text);
            // Convert sentences into words
            const words = preprocessText(sentences.join(' '));

            // Count word pairs in the text
            for (let i = 0; i < words.length - n; i++) {
                // Get the current group of words, join them into a single string, and convert to lowercase
                const currentWords = words.slice(i, i + n).join(' ').toLowerCase();
                // Get the next word after the current group of words
                const nextWord = words[i + n];

                // Update the count of word pairs

                // Check if the current word pair exists in the wordPairsFrequency object
                if (!wordPairsFrequency[currentWords]) {
                    // If the current word pair doesn't exist, create a new object for it
                    wordPairsFrequency[currentWords] = {};
                }

                // Check if the next word exists in the current word pair
                if (!wordPairsFrequency[currentWords][nextWord]) {
                    // If the next word doesn't exist in the current word pair, set its count to 0
                    wordPairsFrequency[currentWords][nextWord] = 0;
                }

                // Increment the count of the word pair by 1
                wordPairsFrequency[currentWords][nextWord]++;
            }

            // Show the results for N-gram overview
            displayNGramOverview();
            // Show the results for prediction
            displayPredictionResults(n);
        })
        .catch(error => console.error('An error occurred while loading the text file:', error));
}

// Function to display the analysis results
function displayNGramOverview() {
    // Retrieve the result container element
    const resultDiv = document.getElementById('result');
    // Clear the existing content
    resultDiv.innerHTML = '';

    // Create a container for N-gram overview
    const nGramDiv = document.createElement('div');
    nGramDiv.innerHTML = '<h2>N-Gram Overview</h2><ul id="nGramList"></ul>';
    resultDiv.appendChild(nGramDiv);

    // Get the input word from the text input field
    const inputWord = document.getElementById('textInput').value.toLowerCase();

    // Sort N-gram pairs by frequency (highest to lowest)
    const sortedPairs = Object.entries(wordPairsFrequency).sort((a, b) =>
        // Compare the frequencies of the word pairs
        Object.values(b[1])[0] - Object.values(a[1])[0]);

    // Keep track of words that have already been shown
    const shownWords = {};

    // Create a list of N-grams to display
    for (let nGram = 0; nGram < Math.min(20, sortedPairs.length); nGram++) {
        const [word, nextWords] = sortedPairs[nGram];
        const nextWord = Object.keys(nextWords)[0];
        const frequency = nextWords[nextWord];

        // Display only N-grams starting with the input word
        if (word.startsWith(inputWord) && !shownWords[nextWord]) {
            const nWordList = document.createElement('li');
            nWordList.textContent = `"${inputWord}" is followed by "${nextWord}" ${frequency} times.`;
            document.getElementById('nGramList').appendChild(nWordList);

            // Mark the next word as shown
            shownWords[nextWord] = true;
        }
    }
}

// Function to display the prediction results
function displayPredictionResults(n) {
    // Retrieve the result container element
    const resultDiv = document.getElementById('result');
    // Create a container for prediction results
    const predictionDiv = document.createElement('div');
    predictionDiv.innerHTML = '<h2>Prediction Results</h2><ul id="predictionList"></ul>';
    resultDiv.appendChild(predictionDiv);

    // Predict and generate sentences
    const startingWords = Object.keys(wordPairsFrequency)[0].split(' ');
    for (let i = 0; i < 20; i++) {
        // Generate a sentence using the predicted next word
        const generatedSentence = generateSentence(startingWords, parseInt(document.getElementById('nValue').value));
        // Create a list item for the generated sentence
        const listItem = document.createElement('li');
        // Display the generated sentence
        listItem.textContent = 'Generated Sentence: ' + generatedSentence;
        // Add the list item to the prediction results container
        document.getElementById('predictionList').appendChild(listItem);
    }
}

// Function to predict the next word based on input words
function predictNextWord(inputWords) {
    // Retrieve possible next words based on input words
    const possibleNextWords = wordPairsFrequency[inputWords];
    // If no possible next words, return null
    if (!possibleNextWords) return null;

    // Retrieve next words and their frequencies
    const nextWords = Object.keys(possibleNextWords);
    // Calculate total frequency of all possible next words
    const totalFrequency = Object.values(possibleNextWords).reduce((acc, freq) => acc + freq, 0);
    // Generate a random number within the total frequency range
    const randomNumber = Math.random() * totalFrequency;

    let cumulativeFrequency = 0;
    // Iterate over each next word and its frequency
    for (const nextWord of nextWords) {
        // Update cumulative frequency
        cumulativeFrequency += possibleNextWords[nextWord];
        // If the cumulative frequency exceeds the random number, return the next word
        if (cumulativeFrequency >= randomNumber) return nextWord;
    }
    // If no word is predicted, return null
    return null;
}

// Function to generate a sentence based on starting words and N value
function generateSentence(startingWords, n) {
    // Initialize the sentence with the starting words
    let sentence = startingWords.join(' ');
    // Generate up to 20 words for the sentence
    for (let i = 0; i < 20; i++) {
        // Predict the next word based on the current sequence of words
        const nextWord = predictNextWord(startingWords.join(' '));
        // If no next word is predicted, break the loop
        if (nextWord === null) break;
        // Append the next word to the sentence
        sentence += ' ' + nextWord;
        // Shift the first word from the starting words array
        startingWords.shift();
        // Add the next word to the end of the starting words array
        startingWords.push(nextWord);
        // If n is greater than 2, we need to adjust the startingWords array
        // to consider more than just the last word
        if (n > 2) {
            // Remove the first word until the array length is equal to n
            while (startingWords.length > n) {
                startingWords.shift();
            }
        }
    }
    // Return the generated sentence
    return sentence;
}