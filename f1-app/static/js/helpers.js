/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* global allDrivers, d3, vis, showTutorialModal */
/*
Gamplay Section

This section handles the gameplay for the Team Orders game.
*/

let nodesArray; let nodes; let edgesArray; let edges; let network;

function makeRequestString(nameList) {
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
    return requestString;
}

async function drawGraph(nameList, element) {
    const requestString = makeRequestString(nameList);

    d3.json(requestString, (error, graph) => {
        if (error) return;
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

            network = new vis.Network(element, data, options);
        }

        startNetwork();
    });
}

function searchForDrivers(e, wrapper, stats, resultPrefix = '') {
    if (e.keyCode > 36 && e.keyCode < 41) {
        // when arrow keys were pressed, do nothing
        return;
    }

    // get user entered data
    const userData = e.target.value;

    // Begin autocomplete only if 2 or more characters are entered by user
    if (userData && (userData.length > 1)) {
        // Look for all names containing the input substring
        const re = new RegExp(`${userData}.+$|${userData}`, 'i');
        const potentialDrivers = allDrivers.filter((e_) => e_.search(re) !== -1);

        // Limit the number of potential drivers to display
        const limit = Math.min(potentialDrivers.length, 5);

        // Show the appropriate buttons
        for (let i = 0; i < limit; i += 1) {
            const button = wrapper.querySelector(`#${resultPrefix}result-${i}`);
            button.value = potentialDrivers[i];
            button.innerHTML = potentialDrivers[i];
        }

        // If the limit is less than 5, hide buttons limit through 5
        if (limit < 5) {
            for (let i = limit; i < 5; i += 1) {
                const button = wrapper.querySelector(`#${resultPrefix}result-${i}`);
                button.value = '';
                button.innerHTML = '';
            }
        }

        // Show search stats unless there are no more potential drivers
        if (potentialDrivers.length === 0) {
            stats.innerHTML = '';
        } else {
            stats.innerHTML = `${limit} of ${potentialDrivers.length.toString()} results for "${userData}"`;
        }
    } else {
        // Delete autocomplete results text if there's nothing to display
        for (let i = 0; i < 5; i += 1) {
            const button = wrapper.querySelector(`#${resultPrefix}result-${i}`);
            button.value = '';
            button.innerHTML = '';
            stats.innerHTML = '';
        }
    }
}

function winnerTrue() {
    window.localStorage.setItem('winner', JSON.stringify(true));
}

function winnerFalse() {
    window.localStorage.setItem('winner', JSON.stringify(false));
}

function solutionShowedFalse() {
    window.localStorage.setItem('solutionShowed', JSON.stringify(false));
}

function solutionShowedTrue() {
    window.localStorage.setItem('solutionShowed', JSON.stringify(true));
}

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