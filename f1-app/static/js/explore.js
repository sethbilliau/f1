/* global d3, drawGraph, searchForDrivers, makeRequestString, nodes, edges */
/*
Explore/Visualize Section

This section handles the gameplay for the Team Orders game.
*/
const graphExplore = document.querySelector('#graph_explore');
const searchWrapperAdd = document.querySelector('#search-container-explore-add');
const searchStatsAdd = document.querySelector('#search_stats_add');
const searchWrapperRemove = document.querySelector('#search-container-explore-remove');
const searchStatsRemove = document.querySelector('#search_stats_remove');
const inputBoxAdd = document.querySelector('#search_bar_add');
const inputBoxRemove = document.querySelector('#search_bar_remove');
const button0Add = document.querySelector('#explore-add-result-0');
const button1Add = document.querySelector('#explore-add-result-1');
const button2Add = document.querySelector('#explore-add-result-2');
const button3Add = document.querySelector('#explore-add-result-3');
const button4Add = document.querySelector('#explore-add-result-4');
const button0Remove = document.querySelector('#explore-remove-result-0');
const button1Remove = document.querySelector('#explore-remove-result-1');
const button2Remove = document.querySelector('#explore-remove-result-2');
const button3Remove = document.querySelector('#explore-remove-result-3');
const button4Remove = document.querySelector('#explore-remove-result-4');
const clearButton = document.querySelector('#clear_graph');

drawGraph(['Lewis Hamilton', 'Jenson Button', 'Sergio Perez', 'Max Verstappen'], graphExplore);

// Search for drivers on each key in the input box
function searchForDriversInputBoxAdd(e) {
    return searchForDrivers(e, searchWrapperAdd, searchStatsAdd, 'explore-add-');
}

// Search for drivers on each key in the input box
function searchForDriversInputBoxRemove(e) {
    return searchForDrivers(e, searchWrapperRemove, searchStatsRemove, 'explore-remove-');
}

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
}

async function addNoDupesEdges(arrProposal, arrExisting, arrNodes, driverID) {
    const lstProposalFrom = arrProposal.map((el) => (el.from));
    const lstProposalTo = arrProposal.map((el) => (el.to));
    const lstExistingFrom = arrExisting.map((el) => (el.from));
    const lstExistingTo = arrExisting.map((el) => (el.to));

    // Combine lists and filter out
    function toFromCombination(lstTo, lstFrom, id) {
        const result = [];
        for (let index = 0; index < lstFrom.length; index += 1) {
            const from = lstFrom[index];
            const to = lstTo[index];
            if (from === id) {
                result.push(to);
            } else {
                result.push(from);
            }
        }
        return result;
    }

    const lstProposal = toFromCombination(lstProposalTo, lstProposalFrom, driverID);

    // get list of existing links
    const lstExistingDriverLinks = [];
    for (let index = 0; index < arrExisting.length; index += 1) {
        const from = lstExistingFrom[index];
        const to = lstExistingTo[index];
        if ((from !== driverID) && (to !== driverID)) {
            // eslint-disable-next-line no-continue
            continue;
        } else if ((from === driverID)) {
            lstExistingDriverLinks.push(to);
        } else {
            lstExistingDriverLinks.push(from);
        }
    }

    // Add links to driver of interest
    const newAdditions = [];
    for (let index = 0; index < lstProposal.length; index += 1) {
        const element = lstProposal[index];
        if (!(lstExistingDriverLinks.includes(element))) {
            newAdditions.push(element);
            const newLink = arrProposal[index];
            arrExisting.add(newLink);
        }
    }

    // Link any teammates together
    const nodesLst = arrNodes.get({ id: 0 });
    const nodesLstFiltered = nodesLst.filter((e) => (newAdditions.includes(e.id)));
    const newAdditionsNames = nodesLstFiltered.map((e) => (e.label));

    const allVisibleDrivers = arrNodes.get({ id: 0 }).map((e) => (e.label));
    for (let index = 0; index < newAdditions.length; index += 1) {
        const candidateName = newAdditionsNames[index];
        const requestString = makeRequestString([candidateName]);

        d3.json(requestString, (error, graph) => {
            if (error) return;

            const teammates = graph.nodes.map((e) => (e.label));
            const teammateIDs = graph.nodes.map((e) => (e.id));
            const dID = teammateIDs[0];

            for (let idx = 0; idx < teammates.length; idx += 1) {
                // Prevent self links
                if (idx === 0) {
                // Prevent duplicate links to those added above
                } else if (teammateIDs[idx] === driverID) {
                // Prevent back and forth links
                } else if (newAdditionsNames.slice(0, index).includes(teammates[idx])) {
                // Otherwise, check and add candidate if appropriate
                } else {
                    const candidate = teammates[idx];
                    if (allVisibleDrivers.includes(candidate)) {
                        try {
                            // Add the link - will error if duplicate
                            arrExisting.add({
                                from: Math.min(dID, teammateIDs[idx]),
                                to: Math.max(dID, teammateIDs[idx]),
                                id: String(Math.min(dID, teammateIDs[idx]))
                                    + String(Math.max(dID, teammateIDs[idx])),
                            });
                        } catch (e) { /* empty */ } // Catch errors for adding a dup link
                    }
                }
            }
        });
    }

    // return arrExisting;
}

async function addDriver() {
    const requestString = makeRequestString([this.textContent]);

    d3.json(requestString, (error, graph) => {
        if (error) return;
        // Add new nodes to the graph
        addNoDupesNodes(graph.nodes, nodes, this.textContent);

        // Get the id of the driver of interest
        const driverID = graph.nodes.filter((e) => (e.label === this.textContent))
            .map((e) => (e.id));
        // Add new edges to the graph
        addNoDupesEdges(graph.links, edges, nodes, driverID[0]);

        // Clear all button text
        for (let i = 0; i < 5; i += 1) {
            const button = searchWrapperAdd.querySelector(`#explore-add-result-${i}`);
            button.value = '';
            button.innerHTML = '';
        }

        // Clear Search Stats
        searchStatsAdd.innerHTML = '';

        // Clear input box of text, focus and select it
        inputBoxAdd.value = '';
        inputBoxAdd.focus();
        inputBoxAdd.select();
    });
}

async function removeDriver() {
    const requestString = makeRequestString([this.textContent]);

    d3.json(requestString, (error, graph) => {
        if (error) return;
        // Get the id of the driver of interest
        const driverID = graph.nodes.filter((e) => (e.label === this.textContent))
            .map((e) => (e.id));

        // Remove the driver node
        nodes.remove({ id: driverID[0] });

        // Clear all button text
        for (let i = 0; i < 5; i += 1) {
            const button = searchWrapperRemove.querySelector(`#explore-remove-result-${i}`);
            button.value = '';
            button.innerHTML = '';
        }

        // Clear Search Stats
        searchStatsRemove.innerHTML = '';

        // Clear input box of text, focus and select it
        inputBoxRemove.value = '';
        inputBoxRemove.focus();
        inputBoxRemove.select();
    });
}

function clearGraph() {
    nodes.map((e) => (nodes.remove({ id: e.id })));
    edges.map((e) => (edges.remove({ id: e.id })));
}

// Draw Base Graph
drawGraph(['Lewis Hamilton', 'Jenson Button', 'Sergio Perez', 'Max Verstappen'], graphExplore);

// Input box for adding
inputBoxAdd.onkeyup = searchForDriversInputBoxAdd;

// Create Handlers for each of the buttons
button0Add.onclick = addDriver;
button1Add.onclick = addDriver;
button2Add.onclick = addDriver;
button3Add.onclick = addDriver;
button4Add.onclick = addDriver;

// Input box for removing a node
inputBoxRemove.onkeyup = searchForDriversInputBoxRemove;

// Create Handlers for each of the buttons
button0Remove.onclick = removeDriver;
button1Remove.onclick = removeDriver;
button2Remove.onclick = removeDriver;
button3Remove.onclick = removeDriver;
button4Remove.onclick = removeDriver;

// Clear Button
clearButton.onclick = clearGraph;
