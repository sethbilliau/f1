/* global showModalSlow, drawGraph, searchForDrivers, allDrivers, showTutorialModal,
          winnerFalse, solutionShowedFalse */
/*
gamplay.js

This file handles the gameplay for the Team Orders game.
*/

// Define variables
const MAX_GUESSES = 6;
let GUESS_COUNTER = 0;
let REMAINING_GUESSES = MAX_GUESSES - GUESS_COUNTER;
let STARTING_DRIVER;
let CURRENT_DRIVER;
let FINAL_DRIVER;
let allDriversGame;
let guessedPlayers;
let guessResults;
const GAMEID = document.querySelector('#data-aws').getAttribute('data-gameID');

// Get certain elements and define them as constants
const searchWrapper = document.querySelector('.search-container');
const inputBox = document.querySelector('.search_bar');
const button0 = document.querySelector('#result-0');
const button1 = document.querySelector('#result-1');
const button2 = document.querySelector('#result-2');
const button3 = document.querySelector('#result-3');
const button4 = document.querySelector('#result-4');
const searchStats = document.querySelector('.search_stats');
const statsModal = document.querySelector('#solution_modal_container');
const solutionEl = document.querySelector('#solution');
const graphWrapperEl = document.querySelector('#graph_wrapper');
const resetButton = document.querySelector('#reset_game_div');

/*

Initialization Section

These functions are used in the initializeGame function that is called onload

*/
// Get the number of remaining guesses
function getRemainingGuesses() {
    document.getElementById('remaining_guesses_number').textContent = `${REMAINING_GUESSES}`;
}

// Fill in the names of the starting and final driver for the game board
function initializeDrivers() {
    STARTING_DRIVER = document.querySelector('#prompt_player_1').textContent;
    FINAL_DRIVER = document.querySelector('#prompt_player_2').textContent;

    // Remove starting and ending drivers from consideration
    allDrivers.splice(allDrivers.indexOf(STARTING_DRIVER), 1);
    allDrivers.splice(allDrivers.indexOf(FINAL_DRIVER), 1);
    allDriversGame = allDrivers.slice();
    CURRENT_DRIVER = STARTING_DRIVER;
}

// Fill in the name of the current driver in the search bar
function searchBarName() {
    inputBox.placeholder = `search for a teammate of ${CURRENT_DRIVER}`;
}

// Add the guess number class to the search wrapper div
function searchBarNumber() {
    searchWrapper.classList.add(`guess_num_${GUESS_COUNTER + 1}`);
}

// Taylor Stein's functions using window local storage
function checkForTutorial() {
    const localTutorial = window.localStorage.getItem('viewedTutorial');
    if (!localTutorial) { // no tutorial evidence in localStorage
        showTutorialModal();
        window.localStorage.setItem('viewedTutorial', JSON.stringify(true));
    }
}

// Initialize the game - to be called on load.
function initializeGame() {
    initializeDrivers();
    getRemainingGuesses();
    searchBarName();
    searchBarNumber();
    checkForTutorial();
}

// focus on the input box
function inputBoxFocus() {
    // Clear input box of text, focus and select it
    inputBox.value = '';
    inputBox.focus();
    inputBox.select();
}

// Reset search wrapper
function resetSearchBarWrapper() {
    // Clear all button text
    for (let i = 0; i < 5; i += 1) {
        const button = searchWrapper.querySelector(`#result-${i}`);
        button.value = '';
        button.innerHTML = '';
    }

    // Clear Search Stats
    searchStats.innerHTML = '';
}

function storeGame() {
    window.localStorage.setItem('gameID', GAMEID);
}

function getParameters() {
    const existingGuessedPlayers = JSON.parse(window.localStorage.getItem('guessedPlayers'));
    const existingGuessResults = JSON.parse(window.localStorage.getItem('guessResults'));
    if (existingGuessedPlayers) {
        guessedPlayers = existingGuessedPlayers;
    } else {
        guessedPlayers = [];
    }

    if (existingGuessResults) {
        guessResults = existingGuessResults;
    } else {
        guessResults = [];
    }
}

function updateSearchBarGetGuessesInputBoxFocus() {
    // Update search bar name
    searchBarName();
    // Get remaining guesses
    getRemainingGuesses();
    // Focus on input box
    inputBoxFocus();
}

async function getTeammates(currentDriver) {
    // Get driver's teammates
    return fetch(`/search?q=${encodeURIComponent(currentDriver)}`)
        .then((response) => response.json())
        .then((responseJson) => responseJson);
}

async function checkCorrectness(teammates, candidateDriver, finalDriver) {
    let result;
    // Check if the candidate driver is in the pool of teammates
    if (teammates.includes(candidateDriver)) {
        const candidateDriverTeammates = await getTeammates(candidateDriver);
        if (candidateDriverTeammates.includes(finalDriver)) {
            result = 'winner';
        } else {
            result = 'correct';
        }
    } else {
        result = 'incorrect';
    }

    return (result);
}

function addGuessToLocalStorage(candidateDriver_, guessCorrectness_) {
    // Check if we are in daily mode
    if (!resetButton) {
        // Add guessed driver to local storage of guessed drivers
        guessedPlayers.push(candidateDriver_);
        window.localStorage.setItem('guessedPlayers', JSON.stringify(guessedPlayers));

        // Add guess result to local storage
        guessResults.push(guessCorrectness_);
        window.localStorage.setItem('guessResults', JSON.stringify(guessResults));
    }
}

function showComeBackDailyText() {
    // Hide Remaining Guesses Counter
    document.querySelector('#remaining_guesses').style.visibility = 'hidden';

    // Show come back text
    document.querySelector('#come_back_daily').style.visibility = 'visible';
}

async function buttonHandler() {
    // get candidate driver
    const candidateDriver = this.textContent;

    // Remove candidate driver from list of available drivers in autocomplete
    allDrivers.splice(allDrivers.indexOf(candidateDriver), 1);

    // Give input box the correct value
    inputBox.value = 'Lights out and away we go!';

    // Increment the guess counter
    GUESS_COUNTER += 1;

    // Decrement Remaining Guesses
    REMAINING_GUESSES -= 1;

    // Get current Row
    const currentRow = document.getElementById(`pool-row-${GUESS_COUNTER}`);

    // Put the candidate driver's name in the current row
    currentRow.textContent = candidateDriver;

    // Get current drivers' teammates
    const currentDriverTeammates = await getTeammates(CURRENT_DRIVER);

    // get correctness of the guess
    const guessCorrectness = await checkCorrectness(
        currentDriverTeammates,
        candidateDriver,
        FINAL_DRIVER,
    );

    // Add guess information to local storage
    addGuessToLocalStorage(candidateDriver, guessCorrectness);

    // If the guess is correct, change the current driver to the candidate driver
    if (guessCorrectness === 'correct') {
        CURRENT_DRIVER = candidateDriver;
    }

    // Remove active row tag
    currentRow.removeAttribute('data-active-pool-row');
    currentRow.setAttribute('data-guess-result', guessCorrectness);

    // If the game is continuing
    if (REMAINING_GUESSES > 0 && guessCorrectness !== 'winner') {
        // Get the next row
        const nextRow = document.getElementById(`pool-row-${GUESS_COUNTER + 1}`);

        // Show new row
        nextRow.setAttribute('data-active-pool-row', '');
        nextRow.removeAttribute('data-hidden-pool-row');

        // Iterate guess number
        searchWrapper.classList.remove(`guess_num_${GUESS_COUNTER}`);
        searchWrapper.classList.add(`guess_num_${GUESS_COUNTER + 1}`);

        // Reset search bar by clearing button text and search stats
        resetSearchBarWrapper();

        // Update search bar name & remaining guesses, focus on input box
        updateSearchBarGetGuessesInputBoxFocus();
    } else {
        searchWrapper.style.visibility = 'hidden';

        if (guessCorrectness === 'winner' || REMAINING_GUESSES === 0) {
            // show come back daily text
            showComeBackDailyText();

            // show solution modal container
            showModalSlow(guessCorrectness);
        } else {
            getRemainingGuesses();
        }
    }
}

async function getSolution(STARTING_DRIVER_, FINAL_DRIVER_) {
    const queryString = `/solve?start=${encodeURIComponent(STARTING_DRIVER_)}&final=${encodeURIComponent(FINAL_DRIVER_)}`;
    return fetch(queryString)
        .then((response) => response.json())
        .then((responseJson) => responseJson);
}

async function buildSolution(nameList, winner) {
    if (winner === 'winner') {
        document.querySelector('#winning_title').textContent = 'You won!';
    } else {
        document.querySelector('#winning_title').textContent = 'Solution';
    }

    const titleSpan1 = document.createElement('span');
    titleSpan1.classList.add('italic', 'solution-copy');
    titleSpan1.textContent = `The shortest teammate path between ${STARTING_DRIVER} and ${FINAL_DRIVER
    } is ${String(nameList.length - 2)} teammate(s) long.`;

    solutionEl.appendChild(titleSpan1);
    solutionEl.appendChild(document.createElement('br'));

    // Add title
    const titleSpan2 = document.createElement('span');
    titleSpan2.classList.add('italic');
    titleSpan2.textContent = "Here's one shortest path:";
    solutionEl.appendChild(titleSpan2);
    solutionEl.appendChild(document.createElement('br'));

    // Clear all button text
    for (let i = 0; i < nameList.length; i += 1) {
        const newSpan = document.createElement('span');
        newSpan.textContent = nameList[i];

        // Make text green except for the first and last
        if (i < (nameList.length - 1) && i !== 0) {
            newSpan.classList.add('solution-correct');
        }

        solutionEl.appendChild(newSpan);

        // Add an arrow except for the last name
        if (i < (nameList.length - 1)) {
            const arrowSpan = document.createElement('span');
            arrowSpan.textContent = ' -> ';
            solutionEl.appendChild(arrowSpan);
        }
    }

    // Add explanation
    solutionEl.appendChild(document.createElement('br'));
    solutionEl.appendChild(document.createElement('br'));
    const titleSpan3 = document.createElement('span');
    titleSpan3.classList.add('italic', 'solution-copy');
    titleSpan3.textContent = 'Explore this path using the graph below. Click and drag the bubbles and the canvas to rearrange the graph. Scroll to zoom.';
    solutionEl.appendChild(titleSpan3);

    await drawGraph(nameList, graphWrapperEl);
}

// eslint-disable-next-line no-unused-vars
async function showSolution(winner = 'winner') {
    // Unhide the solution modal container
    statsModal.classList.add('show');

    // Add winner class to the solution div
    if (winner === 'winner') {
        solutionEl.classList.add('winner');
    }

    // Get current drivers' teammates
    const solutionNames = await getSolution(STARTING_DRIVER, FINAL_DRIVER);

    await buildSolution(solutionNames, winner);
}

// Search for drivers on each key in the input box
function searchForDriversInputBox(e) {
    return searchForDrivers(e, searchWrapper, searchStats);
}

// Reset board
function resetBoard() {
    // hide come back text
    document.querySelector('#come_back_daily').style.visibility = 'hidden';

    // Show Remaining Guesses Counter
    document.querySelector('#remaining_guesses').style.visibility = 'visible';

    // Reset guess number and show search wrapper
    for (let i = 1; i < 7; i += 1) {
        // Remove guess number tags
        searchWrapper.classList.remove(`guess_num_${i}`);

        // Remove row tags
        const currentRow = document.getElementById(`pool-row-${i}`);
        currentRow.setAttribute('data-hidden-pool-row', '');
        currentRow.removeAttribute('data-active-pool-row');
        currentRow.removeAttribute('data-guess-result');
        currentRow.textContent = '';
    }

    // Set the search wrapper as active
    searchWrapper.style.visibility = 'visible';
    searchWrapper.classList.remove(`guess_num_${GUESS_COUNTER + 1}`);
    searchWrapper.classList.add('guess_num_1');

    // Make the first row active
    const firstRow = document.getElementById('pool-row-1');
    firstRow.removeAttribute('data-hidden-pool-row');
    firstRow.setAttribute('data-active-pool-row', '');

    // Reset search bar by clearing button text and search stats
    resetSearchBarWrapper();

    // Reset guess counter and current driver
    GUESS_COUNTER = 0;
    CURRENT_DRIVER = STARTING_DRIVER;
    REMAINING_GUESSES = MAX_GUESSES;

    // Change search bar name and remaining guesses
    updateSearchBarGetGuessesInputBoxFocus();

    // Reset allDrivers list
    // eslint-disable-next-line no-global-assign
    allDrivers = allDriversGame;
}

// Populate existing game if necessary
function populateExistingGame() {
    const existingGuessedPlayers = JSON.parse(window.localStorage.getItem('guessedPlayers'));
    const existingGuessResults = JSON.parse(window.localStorage.getItem('guessResults'));

    for (let index = 0; index < existingGuessedPlayers.length; index += 1) {
        // Get current Row
        const currentRow = document.getElementById(`pool-row-${index + 1}`);
        // Put the candidate driver's name in the current row
        currentRow.textContent = existingGuessedPlayers[index];
        // Remove candidate driver from list of available drivers in autocomplete
        allDrivers.splice(allDrivers.indexOf(existingGuessedPlayers[index]), 1);

        // Remove active row tag or hidden tag
        if (index === 0) {
            currentRow.removeAttribute('data-active-pool-row');
        } else {
            currentRow.removeAttribute('data-hidden-pool-row');
        }

        // Update current driver if guess is correct
        if (existingGuessResults[index] === 'correct') {
            CURRENT_DRIVER = existingGuessedPlayers[index];
        }

        // Set guess result according to guess correctness
        currentRow.setAttribute('data-guess-result', existingGuessResults[index]);
    }
    // Set guess cunter and remaining guesses
    GUESS_COUNTER = existingGuessedPlayers.length;
    REMAINING_GUESSES = MAX_GUESSES - existingGuessedPlayers.length;

    // Get winner status
    const winnerStatus = JSON.parse(window.localStorage.getItem('winner'));
    if (existingGuessedPlayers.length === 6 || winnerStatus) {
        // Hide Search Wrapper
        searchWrapper.style.visibility = 'hidden';

        // show come back daily text
        showComeBackDailyText();
    } else {
        // Get current Row
        const finalRow = document.getElementById(`pool-row-${GUESS_COUNTER + 1}`);

        // Show new row
        finalRow.setAttribute('data-active-pool-row', '');
        finalRow.removeAttribute('data-hidden-pool-row');

        // Iterate guess number
        searchWrapper.classList.remove('guess_num_1');
        searchWrapper.classList.add(`guess_num_${GUESS_COUNTER + 1}`);

        // Update search bar name & remaining guesses, focus on input box
        updateSearchBarGetGuessesInputBoxFocus();
    }
}

// Check for new game
function checkForNewGame() {
    // Get game id from local storage
    const localGameID = window.localStorage.getItem('gameID');

    // Check if there is a local game
    if (!localGameID || localGameID !== GAMEID) {
        storeGame();
        winnerFalse();
        solutionShowedFalse();
    }

    // Get parameters, initialize the game
    getParameters();
    initializeGame();

    // Populate the game if needed
    if (guessedPlayers && guessedPlayers.length > 0) {
        populateExistingGame();
    }
}

inputBox.onkeyup = searchForDriversInputBox;

// Call functions to initialize the game
if (!resetButton) {
    window.onload = checkForNewGame;
} else {
    window.onload = initializeGame;

    // Bind handler if reset button exists
    resetButton.onclick = resetBoard;
}

// Create Handlers for each of the buttons
button0.onclick = buttonHandler;
button1.onclick = buttonHandler;
button2.onclick = buttonHandler;
button3.onclick = buttonHandler;
button4.onclick = buttonHandler;
