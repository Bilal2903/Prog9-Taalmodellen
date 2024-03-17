// Object to store word pairs and their frequencies
let wordPairsFrequency = {};

// Add event listener to the analyze button
document.getElementById('analyzeButton').addEventListener('click', analyzeText);

// Function to analyze the text input
function analyzeText() {
    const text = document.getElementById('textInput').value;
    console.log('Text entered:', text);

    const nValue = parseInt(document.getElementById('nValue').value);
    console.log('Value of n:', nValue);

    generateNGrams(text, nValue);
}

// Preprocess the input text
function preprocessText(text) {
    return text.toLowerCase().match(/\b\w+\b/g);
}

// Split text into sentences
function splitIntoSentences(text) {
    return text.split('.').filter(sentence => sentence.trim() !== '');
}

// Generate N-grams from the text
function generateNGrams(text, n) {
    // Fetch text file
    fetch('Book/under_the_desert_stars.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(text => {
            console.log('Text fetched successfully:', text);

            const sentences = splitIntoSentences(text);
            console.log('Sentences:', sentences);

            const words = preprocessText(sentences.join(' '));
            console.log('Words after preprocessing:', words);

            // Generate word pairs and their frequencies
            for (let i = 0; i < words.length - n; i++) {
                const currentWords = words.slice(i, i + n).join(' ').toLowerCase();
                const nextWord = words[i + n];

                // Update frequency
                if (!wordPairsFrequency[currentWords]) {
                    wordPairsFrequency[currentWords] = {};
                }
                if (!wordPairsFrequency[currentWords][nextWord]) {
                    wordPairsFrequency[currentWords][nextWord] = 0;
                }
                wordPairsFrequency[currentWords][nextWord]++;
            }

            // Display N-gram overview and prediction results
            displayNGramOverview();
            displayPredictionResults(n);
        })
        .catch(error => console.error('An error occurred while loading the text file:', error));
}

// Display N-gram overview
function displayNGramOverview() {
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '';

    const nGramDiv = document.createElement('div');
    nGramDiv.innerHTML = '<h2>N-Gram Overview</h2><ul id="nGramList"></ul>';
    resultDiv.appendChild(nGramDiv);

    const inputWord = document.getElementById('textInput').value.toLowerCase();

    // Sort word pairs by frequency
    const sortedPairs = Object.entries(wordPairsFrequency).sort((a, b) =>
        Object.values(b[1])[0] - Object.values(a[1])[0]);

    const shownWords = {};

    // Display top 20 N-grams
    for (let nGram = 0; nGram < Math.min(20, sortedPairs.length); nGram++) {
        const [currentWord, nextWords] = sortedPairs[nGram];
        const firstNextWord = Object.keys(nextWords)[0];
        const frequency = nextWords[firstNextWord];

        // Show N-gram if it starts with the input word
        if (currentWord.startsWith(inputWord) && !shownWords[firstNextWord]) {
            const nWordList = document.createElement('li');

            nWordList.textContent = `"${inputWord}" is followed by "${firstNextWord}" ${frequency} times.`;

            document.getElementById('nGramList').appendChild(nWordList);

            shownWords[firstNextWord] = true;
        }
    }
}

// Display prediction results
function displayPredictionResults(n) {
    const resultDiv = document.getElementById('result');
    const predictionDiv = document.createElement('div');
    predictionDiv.innerHTML = '<h2>Prediction Results</h2><ul id="predictionList"></ul>';
    resultDiv.appendChild(predictionDiv);

    // Get starting words for prediction
    const startingWords = Object.keys(wordPairsFrequency)[0].split(' ');

    // Generate and display 20 sentences
    for (let i = 0; i < 20; i++) {
        const generatedSentence = generateSentence(startingWords, parseInt(document.getElementById('nValue').value));
        const listItem = document.createElement('li');
        listItem.textContent = 'Generated Sentence: ' + generatedSentence;
        document.getElementById('predictionList').appendChild(listItem);
    }
}

// Predict the next word based on input word
function predictNextWord(inputWord) {
    const possibleNextWords = wordPairsFrequency[inputWord];

    if (!possibleNextWords) return null;

    const nextWords = Object.keys(possibleNextWords);
    const totalFrequency = Object.values(possibleNextWords).reduce((acc, freq) => acc + freq, 0);
    const randomNumber = Math.random() * totalFrequency;
    let cumulativeFrequency = 0;

    // Choose the next word based on frequency
    for (const nextWord of nextWords) {
        cumulativeFrequency += possibleNextWords[nextWord];
        if (cumulativeFrequency >= randomNumber) return nextWord;
    }
    return null;
}

// Generate a sentence based on starting words
function generateSentence(startingWords, n) {
    let sentence = startingWords.join(' ');

    for (let i = 0; i < 20; i++) {
        const nextWord = predictNextWord(startingWords.join(' '));

        if (nextWord === null) break;

        sentence += ' ' + nextWord;

        startingWords.shift();ß
        startingWords.push(nextWord);

        if (n > 2) {
            while (startingWords.length > n) {
                startingWords.shift();
            }
        }
    }
    return sentence;
}