/* global d3, drawGraph, searchForDrivers, makeRequestString, nodes, edges, network */
/*
Explore/Visualize Section

This section handles the gameplay for the Team Orders game.
*/
const graphExplore = document.querySelector('#graph_explore');
const searchWrapper = document.querySelector('#search-container-explore');
const searchStats = document.querySelector('#search_stats');
const inputBox = document.querySelector('#search_bar');
const button0 = document.querySelector('#explore-result-0');
const button1 = document.querySelector('#explore-result-1');
const button2 = document.querySelector('#explore-result-2');
const button3 = document.querySelector('#explore-result-3');
const button4 = document.querySelector('#explore-result-4');

drawGraph(['Lewis Hamilton', 'Jenson Button', 'Sergio Pérez', 'Max Verstappen'], graphExplore);

// Search for drivers on each key in the input box
function searchForDriversInputBox(e) {
    return searchForDrivers(e, searchWrapper, searchStats, 'explore-');
}

inputBox.onkeyup = searchForDriversInputBox;

function addNoDupesNodes(arrProposal, arrExisting, driverName) {
    const lstProposal = arrProposal.map((el) => (el.label));
    const lstExisting = arrExisting.map((el) => (el.label));

    for (let index = 0; index < arrProposal.length; index += 1) {
        const element = lstProposal[index];
        if (!(lstExisting.includes(element))) {
            const newNode = arrProposal[index];
            arrExisting.add(newNode);
        } else if (element === driverName) {
            const driverNode = arrProposal[index];
            driverNode.group = 'path';
            arrExisting.update(driverNode);
        }
    }

    return arrExisting;
}

function addNoDupesEdges(arrProposal, arrExisting, driverID) {
    const lstProposalFrom = arrProposal.map((el) => (el.from));
    const lstProposalTo = arrProposal.map((el) => (el.to));
    const lstExistingFrom = arrExisting.map((el) => (el.from));
    const lstExistingTo = arrExisting.map((el) => (el.to));

    // Combine lists and filter out
    const lstProposal = [];
    for (let index = 0; index < lstProposalFrom.length; index += 1) {
        const from = lstProposalFrom[index];
        const to = lstProposalTo[index];
        if (from === driverID) {
            lstProposal.push(to);
        } else {
            lstProposal.push(from);
        }
    }

    const lstExistingDriverLinks = [];
    for (let index = 0; index < arrExisting.length; index += 1) {
        const from = lstExistingFrom[index];
        const to = lstExistingTo[index];
        if ((from !== driverID) && (to !== driverID)) {
            continue;
        } else if ((from === driverID)) {
            lstExistingDriverLinks.push(to);
        } else {
            lstExistingDriverLinks.push(from);
        }
    }

    for (let index = 0; index < lstProposal.length; index += 1) {
        const element = lstProposal[index];

        if (!(lstExistingDriverLinks.includes(element))) {
            const newLink = arrProposal[index];
            arrExisting.add(newLink);
        }
    }

    return arrExisting
}

async function addDriver() {
    console.log(this.textContent);

    const requestString = makeRequestString([this.textContent]);

    d3.json(requestString, (error, graph) => {
        if (error) return;
        console.log(graph.nodes);
        nodes = addNoDupesNodes(graph.nodes, nodes, this.textContent);


        // Get the id of the driver of interest
        const driverID = graph.nodes.filter((e) => (e.label === this.textContent))
            .map((e) => (e.id));
        console.log(driverID);
        edges = addNoDupesEdges(graph.links, edges, driverID[0]);
    });
}
// Create Handlers for each of the buttons
button0.onclick = addDriver;
button1.onclick = addDriver;
button2.onclick = addDriver;
button3.onclick = addDriver;
button4.onclick = addDriver;
