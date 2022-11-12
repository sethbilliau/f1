/*
Gamplay Section

This section handles the gameplay for the Team Orders game. 
*/

console.log("Loading gamplay.js")

// Define variables
let MAX_GUESSES = 6;
let GUESS_COUNTER = 0;
let REMAINING_GUESSES = MAX_GUESSES - GUESS_COUNTER;
let STARTING_DRIVER;
let CURRENT_DRIVER;
let FINAL_DRIVER;

// Get certain elements and define them as constants
const searchWrapper = document.querySelector(".search-container");
const inputBox = document.querySelector("#search_bar");
const button0 = document.querySelector("#result-0");
const button1 = document.querySelector("#result-1");
const button2 = document.querySelector("#result-2");
const button3 = document.querySelector("#result-3");
const button4 = document.querySelector("#result-4");
const searchStats = document.querySelector("#search_stats");
const finalRow = document.querySelector('#pool-row-end');
const statsModal = document.querySelector("#solution_modal_container");
const solutionEl = document.querySelector("#solution");
const graphWrapperEl = document.querySelector("#graph_wrapper");


// Get the number of remaining guesses
function getRemainingGuesses() {
    document.getElementById("remaining_guesses_number").textContent = REMAINING_GUESSES + "";
}

// Fill in the names of the starting and final driver for the game board
function initializeDrivers() {
    STARTING_DRIVER = document.querySelector("#prompt_player_1").textContent;
    FINAL_DRIVER = document.querySelector("#prompt_player_2").textContent;
    CURRENT_DRIVER = STARTING_DRIVER;
}

// Fill in the name of the current driver in the search bar
function searchBarName() {
    inputBox.placeholder="search for a teammate of " + CURRENT_DRIVER
}

// Add the guess number class to the search wrapper div
function searchBarNumber() {
    searchWrapper.classList.add("guess_num_" + (GUESS_COUNTER + 1))
}

// // hide final row if needed
// function hideFinalRow() { 
//     finalRow.classList.add("hidden");
// }

// // unhide final row if needed
// function unhideFinalRow() { 
//     if (finalRow.classList.contains('hidden')){
//         finalRow.classList.remove("hidden");
//     }
// }

// Initialize the game - to be called on load. 
function initializeGame() {
    initializeDrivers();
    getRemainingGuesses();
    searchBarName();
    searchBarNumber()
}

function searchForDrivers(e){
    // get user entered data
    let userData = e.target.value; 

    // Begin autocomplete only if 2 or more characters are entered by user
    if(userData && (userData.length > 1)){
        
        // Look for all names containing the input substring
        let re = new RegExp(userData+'.+$', 'i');
        const potentialDrivers = allDrivers.filter(function(e){
            return e.search(re) !== -1;
        });

        // Limit the number of potential drivers to display
        let limit = Math.min(potentialDrivers.length, 5)

        // Show the appropriate buttons 
        for (let i = 0; i < limit; i++){
            let button = searchWrapper.querySelector("#result-" + i);
            button.value = potentialDrivers[i];
            button.innerHTML = potentialDrivers[i];
        }

        // If the limit is less than 5, hide buttons limit through 5
        if (limit < 5){
            for (let i = limit; i < 5; i++){
                let button = searchWrapper.querySelector("#result-" + i);
                button.value = "";
                button.innerHTML = "";
            }
        }

        // If the limit is equal to 1, hide the final row to remove an annoyingly-formatted line. 
        // if (limit === 1){ 
        //     hideFinalRow()
        // } else {
        //     unhideFinalRow()
        // }

        // Show search stats unless there are no more potential drivers
        if (potentialDrivers.length === 0) {
            searchStats.innerHTML = "";
        } else {
            searchStats.innerHTML = limit + ' of ' + potentialDrivers.length.toString() + ' results for "' + userData + '"';
        }
    } else { 
        // Delete autocomplete results text if there's nothing to display 
        for (let i = 0; i < 5; i++){
            let button = searchWrapper.querySelector("#result-" + i);
            button.value = "";
            button.innerHTML = "";
            searchStats.innerHTML = "";
        }
    }


    
};

async function buttonHandler() {
    // get candidate driver 
    let candidateDriver = this.textContent;

    // Give input box the correct value
    // inputBox.value = candidateDriver - TODO decide if the we are checking joke is funny 
    inputBox.value = "wE aRe ChEcKiNg..."

    // Increment the guess counter  
    GUESS_COUNTER++;

    // Decrement Remaining Guesses
    REMAINING_GUESSES--;

    console.log(GUESS_COUNTER);
    console.log(REMAINING_GUESSES);

    // Get current Row
    let currentRow = document.getElementById("pool-row-" + GUESS_COUNTER);

    // Put the candidate driver's name in the current row
    currentRow.textContent = candidateDriver;
    
    // Get current drivers' teammates
    let currentDriverTeammates = await getTeammates(CURRENT_DRIVER);

    // get correctness of the guess
    let guessCorrectness = await checkCorrectness(currentDriverTeammates, candidateDriver, FINAL_DRIVER, currentRow);

    // If the guess is correct, change the current driver to the candidate driver 
    if (guessCorrectness === "correct"){
        CURRENT_DRIVER = candidateDriver;
    }

    // Remove active row tag
    currentRow.removeAttribute("data-active-pool-row");
    currentRow.setAttribute("data-guess-result", guessCorrectness);
    
    // If the game is continuing
    if (REMAINING_GUESSES > 0 && guessCorrectness !== "winner"){
        // Get the next row 
        let nextRow = document.getElementById("pool-row-" + (GUESS_COUNTER + 1));
        
        // Show new row
        nextRow.setAttribute("data-active-pool-row", "");
        nextRow.removeAttribute("data-hidden-pool-row");

        // Iterate guess number
        searchWrapper.classList.remove("guess_num_" + GUESS_COUNTER);
        searchWrapper.classList.add("guess_num_" + (GUESS_COUNTER+1));

        // Clear all button text
        for (let i = 0; i < 5; i++){
            let button = searchWrapper.querySelector("#result-" + i);
            button.value = "";
            button.innerHTML = "";
        }

        // Clear Search Stats
        searchStats.innerHTML = "";

        // Change search bar name and remaining guesses 
        searchBarName();
        getRemainingGuesses();

        // Clear input box of text, focus and select it
        inputBox.value = "";
        inputBox.focus();
        inputBox.select();
    
    } else {
        searchWrapper.remove();

        if (guessCorrectness === "winner") {
            // Remove Remaining Guesses Counter
            document.querySelector("#remaining_guesses").remove();

            showModalSlow();
            
        } else { 
            getRemainingGuesses();
        }
    }
}

async function getTeammates(currentDriver){
    // Get driver's teammates 
    return fetch("/search?q=" + encodeURIComponent(currentDriver))
    .then(response => response.json())
    .then((responseJson)=>{return responseJson});
}

async function checkCorrectness(teammates, candidateDriver, finalDriver, currentRow){
    let result;
    // Check if the candidate driver is in the pool of teammates 
    if (teammates.includes(candidateDriver)) {
        const candidateDriverTeammates = await getTeammates(candidateDriver);
        if (candidateDriverTeammates.includes(finalDriver)){
            result = "winner"
        } else {
            result = "correct"
        }
    } else {
        result = "incorrect" 
    }

    // unhide final row if necessary
    // unhideFinalRow()

    return(result)
}

async function getSolution(STARTING_DRIVER, FINAL_DRIVER){
    let queryString = "/solve?start=" + encodeURIComponent(STARTING_DRIVER) + "&final=" + encodeURIComponent(FINAL_DRIVER) 
    return fetch(queryString)
    .then(response => response.json())
    .then((responseJson)=>{return responseJson});
}

async function showSolution(){
    // Unhide the solution modal container
    statsModal.classList.add('show');

    // Add winner class to the solution div
    solutionEl.classList.add('winner');

    // Get current drivers' teammates
    let solutionNames = await getSolution(STARTING_DRIVER, FINAL_DRIVER);

    await buildSolution(solutionNames);
}

async function buildSolution(nameList) {

    let titleSpan1 = document.createElement('span')
    titleSpan1.classList.add('italic')
    titleSpan1.textContent = "The shortest teammate path between " + STARTING_DRIVER + " and " + FINAL_DRIVER +
                             " is " + String(nameList.length - 2) + " teammate(s) long."
                        
    solutionEl.appendChild(titleSpan1)
    solutionEl.appendChild(document.createElement('br'))
    solutionEl.appendChild(document.createElement('br'))
    // Add title
    let titleSpan2 = document.createElement('span')
    titleSpan2.classList.add('italic')
    titleSpan2.textContent = "Here's one shortest path:"
    solutionEl.appendChild(titleSpan2)
    solutionEl.appendChild(document.createElement('br'))

    // Clear all button text
    for (let i = 0; i < nameList.length; i++){

        let newSpan = document.createElement('span');
        newSpan.textContent = nameList[i]

        // Make text green except for the first and last
        if ( i < (nameList.length - 1) && i !== 0 ) { 
            newSpan.classList.add('solution-correct')
        }

        solutionEl.appendChild(newSpan);

        // Add an arrow except for the last name
        if ( i < (nameList.length - 1)) { 
            let arrowSpan = document.createElement('span');
            arrowSpan.textContent = " -> "
            solutionEl.appendChild(arrowSpan);
        }
    }

    await drawGraph(nameList.length, STARTING_DRIVER);
}


async function drawGraph(limit, driver){ 
    limit = 1
    
    d3.json("/graph?limit=" + encodeURIComponent(limit) + "&driver=" + encodeURIComponent(driver), function(error, graph) {
        if (error) return;
        var nodesArray, nodes, edgesArray, edges, network;
        function startNetwork() {

            // create an array with nodes
            nodesArray = graph.nodes
            nodes = new vis.DataSet(nodesArray);

            // create an array with edges
            edgesArray = graph.links
            edges = new vis.DataSet(edgesArray);

            // create a network
            let data = {
                nodes: nodes,
                edges: edges,
            };

            let options = {};

            network = new vis.Network(graphWrapperEl, data, options);
        }
                
        startNetwork();

    });
}

// Search for drivers on each key in the input box 
inputBox.onkeyup = searchForDrivers

// Call functions to initialize the game
window.onload = initializeGame;

// Create Handlers for each of the buttons
button0.onclick = buttonHandler;
button1.onclick = buttonHandler;
button2.onclick = buttonHandler;
button3.onclick = buttonHandler;
button4.onclick = buttonHandler;