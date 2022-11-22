/* global showModalSlow, drawGraph, searchForDrivers */
/*
Gamplay Section

This section handles the gameplay for the Team Orders game.
*/

// Define variables
const MAX_GUESSES = 6;
let GUESS_COUNTER = 0;
let REMAINING_GUESSES = MAX_GUESSES - GUESS_COUNTER;
let STARTING_DRIVER;
let CURRENT_DRIVER;
let FINAL_DRIVER;

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

// Get the number of remaining guesses
function getRemainingGuesses() {
    document.getElementById('remaining_guesses_number').textContent = `${REMAINING_GUESSES}`;
}

// Fill in the names of the starting and final driver for the game board
function initializeDrivers() {
    STARTING_DRIVER = document.querySelector('#prompt_player_1').textContent;
    FINAL_DRIVER = document.querySelector('#prompt_player_2').textContent;
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

// Initialize the game - to be called on load.
function initializeGame() {
    initializeDrivers();
    getRemainingGuesses();
    searchBarName();
    searchBarNumber();
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

async function buttonHandler() {
    // get candidate driver
    const candidateDriver = this.textContent;

    // Give input box the correct value
    // inputBox.value = candidateDriver - TODO decide if the we are checking joke is funny
    inputBox.value = 'wE aRe ChEcKiNg...';

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

        // Clear all button text
        for (let i = 0; i < 5; i += 1) {
            const button = searchWrapper.querySelector(`#result-${i}`);
            button.value = '';
            button.innerHTML = '';
        }

        // Clear Search Stats
        searchStats.innerHTML = '';

        // Change search bar name and remaining guesses
        searchBarName();
        getRemainingGuesses();

        // Clear input box of text, focus and select it
        inputBox.value = '';
        inputBox.focus();
        inputBox.select();
    } else {
        searchWrapper.style.visibility = 'hidden';

        if (guessCorrectness === 'winner') {
            // Hide Remaining Guesses Counter
            document.querySelector('#remaining_guesses').style.visibility = 'hidden';

            // show come back text
            document.querySelector('#come_back_daily').style.visibility = 'visible';

            // show solution modal container
            showModalSlow();
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

async function buildSolution(nameList) {
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
async function showSolution() {
    // Unhide the solution modal container
    statsModal.classList.add('show');

    // Add winner class to the solution div
    solutionEl.classList.add('winner');

    // Get current drivers' teammates
    const solutionNames = await getSolution(STARTING_DRIVER, FINAL_DRIVER);

    await buildSolution(solutionNames);
}

// Search for drivers on each key in the input box
function searchForDriversInputBox(e) {
    return searchForDrivers(e, searchWrapper, searchStats);
}

// Reset board 
function resetBoard() {
    // hide come back text
    document.querySelector('#come_back_daily').style.visibility = 'hidden';

    // show Remaining Guesses Counter
    document.querySelector('#remaining_guesses').style.visibility = 'visible';

    // Reset guess number
    searchWrapper.classList.remove(`guess_num_${GUESS_COUNTER + 1}`);
    searchWrapper.classList.add(`guess_num_1`);

    for (let i = 2; i < 7; i = i + 1) {
        // Get current Row
        const currentRow = document.getElementById(`pool-row-${i}`);
        currentRow.setAttribute('data-hidden-pool-row', "");
        currentRow.removeAttribute('data-active-pool-row');
        currentRow.removeAttribute('data-guess-result');
    }

    // Make the first row active
    // Get current Row
    const firstRow = document.getElementById(`pool-row-1`);
    firstRow.removeAttribute('data-active-pool-row');
    firstRow.removeAttribute('data-guess-result');
    firstRow.setAttribute('data-active-pool-row', "");

    // Reset guess counter and current driver
    GUESS_COUNTER = 0;
    CURRENT_DRIVER = STARTING_DRIVER; 
    REMAINING_GUESSES = MAX_GUESSES; 

    // Reset remaining guesses
    getRemainingGuesses();
}

inputBox.onkeyup = searchForDriversInputBox;

// Call functions to initialize the game
window.onload = initializeGame;

// Create Handlers for each of the buttons
button0.onclick = buttonHandler;
button1.onclick = buttonHandler;
button2.onclick = buttonHandler;
button3.onclick = buttonHandler;
button4.onclick = buttonHandler;

if (resetButton){
    resetButton.onclick = resetBoard;
}