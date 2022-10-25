console.log("script.js")

let MAX_GUESSES = 6;
let GUESS_COUNTER = 0;
let REMAINING_GUESSES = MAX_GUESSES - GUESS_COUNTER;
let STARTING_DRIVER = "Lewis Hamilton";
let CURRENT_DRIVER = STARTING_DRIVER;
let FINAL_DRIVER = "Max Verstappen";

function getRemainingGuesses() {
    document.getElementById("remaining_guesses_number").textContent = REMAINING_GUESSES + "";

};

function getNamesForText() {
    document.getElementById("prompt_player_1").textContent = STARTING_DRIVER;
    document.getElementById("prompt_player_2").textContent = FINAL_DRIVER;
};

function searchBarName() {
    document.getElementById("search_bar").placeholder="search for a teammate of " + CURRENT_DRIVER
};


function searchBarNumber() {
    document.getElementById("search-container").classList.add("guess_num_" + (GUESS_COUNTER + 1))
};


window.onload = function() {
    getNamesForText();
    getRemainingGuesses();
    searchBarName();
    searchBarNumber()
};


let searchWrapper = document.getElementById("search-container");
let inputBox = searchWrapper.querySelector("input");
let button0 = searchWrapper.querySelector("#result-0");
let button1 = searchWrapper.querySelector("#result-1");
let button2 = searchWrapper.querySelector("#result-2");
let button3 = searchWrapper.querySelector("#result-3");
let button4 = searchWrapper.querySelector("#result-4");

inputBox.onkeyup = (e)=>{
    let userData = e.target.value; //user enetered data

    // Begin autocomplete only if 2 or more characters are entered by user
    if(userData && (userData.length > 1)){
        
        // Look for all names containing the input substring
        let re = new RegExp(userData+'.+$', 'i');
        potentialDrivers = allDrivers.filter(function(e, i, a){
            return e.search(re) != -1;
        });

        // Limit the number of potential drivers to display
        let limit = Math.min(potentialDrivers.length, 5)
        for (let i = 0; i < limit; i++){
            button = searchWrapper.querySelector("#result-" + i);
            button.textContent = potentialDrivers[i];
        }
        if (limit < 4){
            for (let i = limit; i < 5; i++){
                button = searchWrapper.querySelector("#result-" + i);
                button.textContent = "";
            }
        }

    } else { 
        for (let i = 0; i < 5; i++){
            button = searchWrapper.querySelector("#result-" + i);
            button.textContent = "";
        }
    }
};


button0.onclick = buttonHandler
button1.onclick = buttonHandler
button2.onclick = buttonHandler
button3.onclick = buttonHandler
button4.onclick = buttonHandler

function buttonHandler() {
    let candidateDriver = this.textContent;

    // Increment the guess counter  
    GUESS_COUNTER++;

    // Decrement Remaining Guesses
    REMAINING_GUESSES--;

    // Check correctness of the input 
    inputResult = checkAnswer(candidateDriver, CURRENT_DRIVER, FINAL_DRIVER)

    if (inputResult == "correct"){
        CURRENT_DRIVER = candidateDriver;

    }
    console.log(GUESS_COUNTER)
    console.log(REMAINING_GUESSES)
    
    // Get current Row
    let currentRow = document.getElementById("pool-row-" + GUESS_COUNTER);

    // Remove active row tag
    currentRow.removeAttribute("data-active-pool-row");
    currentRow.setAttribute("data-guess-result", inputResult);

    // Put selected Driver in row
    currentRow.textContent = candidateDriver;
        
    
    if (REMAINING_GUESSES > 0){
        
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
            button = searchWrapper.querySelector("#result-" + i);
            button.textContent = "";
        }

        // Change search bar name and remaining guesses 
        searchBarName();
        getRemainingGuesses();

        // Clear input box of text, focus and select it
        inputBox.value = "";
        inputBox.focus();
        inputBox.select();
    
    } else {
        searchWrapper.remove();
        getRemainingGuesses();
    }
};


checkAnswer = function(candidateDriver, currentDriver, finalDriver){
    if (candidateDriver == finalDriver){
        return("winner");
    } 
    else {
        return("incorrect");
    }

    return "correct"
}