/* global graphWrapperEl, statsModal, showSolution, solutionEl */
/*
Solution Modal Section.

This code manages the navigation for the solution container which shows the user
the solution to the game along with a fun graph to encourage them to explore
relationships between teammates
*/

// Define constants
const modalX = document.querySelector('#close_button');
const showStatsNavEl = document.querySelector('#show_soln');

// Show Solution modal container slowly (defined in styles.css)
function showModalSlow(winner = 'winner') {
    statsModal.style.visibility = 'visible';
    statsModal.classList.add('show');

    // Call the appropriate gameplay functions for the solution to the game
    showSolution(winner);
}

// Hide the solution modal container
function hideModal() {
    statsModal.style.visibility = 'hidden';
    if (statsModal.classList.contains('show')) {
        statsModal.classList.remove('show');
    }

    if (statsModal.classList.contains('fast')) {
        statsModal.classList.remove('fast');
    }

    // Clear solution
    solutionEl.innerHTML = '';
    graphWrapperEl.innerHTML = '';
}

// Close button and nav bar for solution modal container
modalX.onclick = hideModal;
showStatsNavEl.onclick = showModalSlow;

/*
Tutorial Section.

This code manages the navigation for the tutorial container which explains to the
user how to play the game.
*/

// Define constants
const tutorialX = document.getElementById('tutorial-modal-close-button');
const tutorialContainer = document.getElementById('tutorial-container');
const navTutorial = document.getElementById('nav-tutorial');

// function to show the tutorial modal container
function showTutorialModal() {
    tutorialContainer.style.visibility = 'visible';
    tutorialContainer.classList.add('show');
    tutorialContainer.classList.remove('hidden');
}

function hideTutorialModal() {
    tutorialContainer.style.visibility = 'hidden';
    tutorialContainer.classList.add('hidden');
    tutorialContainer.classList.remove('show');
}

// Hide the tutorial modal container upon click
tutorialX.onclick = hideTutorialModal;

// Show the tutorial modal upon clicking the tutorial nav item
navTutorial.onclick = showTutorialModal;
