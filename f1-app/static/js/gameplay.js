/* global allDrivers, showModalSlow, d3, vis */
/*
Gamplay Section

This section handles the gameplay for the Team Orders game.
*/

console.log('Loading gamplay.js');

// Define variables
const MAX_GUESSES = 6;
let GUESS_COUNTER = 0;
let REMAINING_GUESSES = MAX_GUESSES - GUESS_COUNTER;
let STARTING_DRIVER;
let CURRENT_DRIVER;
let FINAL_DRIVER;

// Get certain elements and define them as constants
const searchWrapper = document.querySelector('.search-container');
const inputBox = document.querySelector('#search_bar');
const button0 = document.querySelector('#result-0');
const button1 = document.querySelector('#result-1');
const button2 = document.querySelector('#result-2');
const button3 = document.querySelector('#result-3');
const button4 = document.querySelector('#result-4');
const searchStats = document.querySelector('#search_stats');
const statsModal = document.querySelector('#solution_modal_container');
const solutionEl = document.querySelector('#solution');
const graphWrapperEl = document.querySelector('#graph_wrapper');

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

function searchForDrivers(e) {
    // get user entered data
    const userData = e.target.value;

    // Begin autocomplete only if 2 or more characters are entered by user
    if (userData && (userData.length > 1)) {
        // Look for all names containing the input substring
        const re = new RegExp(`${userData}.+$`, 'i');
        const potentialDrivers = allDrivers.filter((e_) => e_.search(re) !== -1);

        // Limit the number of potential drivers to display
        const limit = Math.min(potentialDrivers.length, 5);

        // Show the appropriate buttons
        for (let i = 0; i < limit; i += 1) {
            const button = searchWrapper.querySelector(`#result-${i}`);
            button.value = potentialDrivers[i];
            button.innerHTML = potentialDrivers[i];
        }

        // If the limit is less than 5, hide buttons limit through 5
        if (limit < 5) {
            for (let i = limit; i < 5; i += 1) {
                const button = searchWrapper.querySelector(`#result-${i}`);
                button.value = '';
                button.innerHTML = '';
            }
        }

        // Show search stats unless there are no more potential drivers
        if (potentialDrivers.length === 0) {
            searchStats.innerHTML = '';
        } else {
            searchStats.innerHTML = `${limit} of ${potentialDrivers.length.toString()} results for "${userData}"`;
        }
    } else {
        // Delete autocomplete results text if there's nothing to display
        for (let i = 0; i < 5; i += 1) {
            const button = searchWrapper.querySelector(`#result-${i}`);
            button.value = '';
            button.innerHTML = '';
            searchStats.innerHTML = '';
        }
    }
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
        searchWrapper.remove();

        if (guessCorrectness === 'winner') {
            // Remove Remaining Guesses Counter
            document.querySelector('#remaining_guesses').remove();

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

async function drawGraph(nameList) {
    const limit = nameList.length;

    if (limit < 1 || limit > 5) {
        throw new Error('Invalid Player List');
    }

    let requestString = '/graph?';
    for (let i = 0; i < limit; i += 1) {
        requestString = requestString.concat('driver', encodeURIComponent(i + 1), '=', encodeURIComponent(nameList[i]));
        if (i !== limit) {
            requestString = requestString.concat('&');
        }
    }

    d3.json(requestString, (error, graph) => {
        if (error) return;
        let nodesArray; let nodes; let edgesArray; let edges; let network;
        function startNetwork() {
            // create an array with nodes
            nodesArray = graph.nodes;
            nodes = new vis.DataSet(nodesArray);

            // create an array with edges
            edgesArray = graph.links;
            edges = new vis.DataSet(edgesArray);

            // create a network
            const data = {
                nodes,
                edges,
            };

            const options = {
                groups: {
                    path: { color: { background: 'lightblue' } },
                    nonpath: { color: { background: 'lightgray' } },
                },
            };

            network = new vis.Network(graphWrapperEl, data, options);
        }

        startNetwork();
    });
}

async function buildSolution(nameList) {
    const titleSpan1 = document.createElement('span');
    titleSpan1.classList.add('italic', 'solution-copy');
    titleSpan1.textContent = `The shortest teammate path between ${STARTING_DRIVER} and ${FINAL_DRIVER
    } is ${String(nameList.length - 2)} teammate(s) long.`;

    solutionEl.appendChild(titleSpan1);

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

    await drawGraph(nameList);
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
inputBox.onkeyup = searchForDrivers;

// Call functions to initialize the game
window.onload = initializeGame;

// Create Handlers for each of the buttons
button0.onclick = buttonHandler;
button1.onclick = buttonHandler;
button2.onclick = buttonHandler;
button3.onclick = buttonHandler;
button4.onclick = buttonHandler;
