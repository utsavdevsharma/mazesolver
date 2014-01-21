/*
helper utility , adding last function to array prototype so that we can directly get the last element without poping.
e.g. [20, 30, 40].last() // gives 40
*/
Array.prototype.last = function() {
	return this.slice(-1)[0];
}

/*
Definition of a Maze
*/
function maze() {
	this.entry = "[0,1]"; // given entry point
	this.exit = "[4,3]"; // given exit point
	this.mazeSize = 5; // given size
	this.travelledQueue = []; // array to store the nodes of current path in traversal, to find the solution
	this.prevMazeBox = null; // last verified node and maked step taken
	this.currentMazeBox = null; // current node under processing
	this.motionDirections = ['top','right','bottom','left']; // motion directions
	this.initializedBoxes = []; // array to store already initialized nodes, prevents duplication, saves memory.
	this.lastOneDiscarded = null; // last node poped from maze.travelledQueue[] , if the current path is blocked and this node do not have any more options to take a step
}

/*
A step is taken, say it moved from [x,y] to [x',y'], now add the last node [x,y] to maze.travelledQueue[]
*/
maze.prototype.pushInQueue = function() {
	if ( this.travelledQueue.last() != this.prevMazeBox ) { // if trying a new path, the last node was already added to maze.travelledQueue[] , do not add that node again.
		this.travelledQueue.push(this.prevMazeBox);
	}
};

/*
pop last node from maze.travelledQueue[] and store it in maze.lastOneDiscarded
*/
maze.prototype.popFromQueue = function() {
	this.lastOneDiscarded = this.travelledQueue.pop();
	this.lastOneDiscarded.domElem.removeAttr('data-solved').attr('data-dormant',''); // remove the visual sign of step taken, make it visually dormant
	if ( this.travelledQueue.length == 0 ) {
	// if in reverse traversal to find a new path, the maze.travelledQueue[] got empty, there can be no more open paths. Give the output of 'blocked'
		sayBlocked();
	}
};

/*
mark current node as active, store it in maze.currentMazeBox
param1::  type: node (mazeBox)
*/
maze.prototype.markActiveBox = function(box) {
	box.domElem.attr("data-checking","yes"); // add the visual sign of processing
	this.currentMazeBox = box;
};

/*
remove the visual sign of processing
param1::  type: node (mazeBox)
*/
maze.prototype.markChecked = function(box) {
	box.domElem.removeAttr("data-checking");
};

/*
Mark nect node as active, take step, move from [x,y] to [x',y']
param1::  type: node (mazeBox)
*/
maze.prototype.takeStep = function(box) {
	verbose(box.xy); // give verbose of current node co-ordinates
	this.markChecked(box); // remove the visual sign of processing
	this.prevMazeBox = box; // last node checked successful, took step ahead from this
	this.pushInQueue(); // add this node to maze.travelledQueue[]
	box.domElem.attr("data-solved","yes"); // add visual sign of step taken
};

/*
Initialize the core maze
*/
window.coreMaze = new maze();

/*
find the co-ordinates of node just above of given node
param1::  type: node (mazeBox)
*/
function getAboveBox(cords) {
	var cordsArray = JSON.parse(cords); // covert string to arrray, for mathematical operations
	cordsArray[1] = cordsArray[1]+1; // increase value of y co-ordinate
	if (cordsArray[1]<coreMaze.mazeSize) { return "["+cordsArray.toString()+"]"; } else { return null; } // if node exists, return the co-ordinates, else return null
}

/*
find the co-ordinates of node just below of given node
param1::  type: node (mazeBox)
*/
function getBelowBox(cords) {
	var cordsArray = JSON.parse(cords); // covert string to arrray, for mathematical operations
	cordsArray[1] = cordsArray[1]-1; // decrease value of y co-ordinate
	if (cordsArray[1]>=0) { return "["+cordsArray.toString()+"]"; } else { return null; } // if node exists, return the co-ordinates, else return null
}

/*
find the co-ordinates of node just right of given node
param1::  type: node (mazeBox)
*/
function getRightBox(cords) {
	var cordsArray = JSON.parse(cords); // covert string to arrray, for mathematical operations
	cordsArray[0] = cordsArray[0]+1; // increase value of x co-ordinate
	if (cordsArray[0]<coreMaze.mazeSize) { return "["+cordsArray.toString()+"]"; } else { return null; } // if node exists, return the co-ordinates, else return null
}

/*
find the co-ordinates of node just left of given node
param1::  type: node (mazeBox)
*/
function getLeftBox(cords) {
	var cordsArray = JSON.parse(cords); // covert string to arrray, for mathematical operations
	cordsArray[0] = cordsArray[0]-1; // decrease value of x co-ordinate
	if (cordsArray[0]>=0) { return "["+cordsArray.toString()+"]"; } else { return null; } // if node exists, return the co-ordinates, else return null
}

/*
Definition of mazeBox
param1::  type: string (co-ordinates array, e.g. "[0,1]")
*/
function mazeBox(cords) {
	this.xy = cords; // store the co-ordinates
	this.domElem = $('[data-cords="'+cords+'"]'); // store the corresponding dom object
	this.open = this.domElem.attr('data-path-open'); // is this node open or not. Possible values: "yes" | "no"
	this.adjacentBoxes = [getAboveBox(cords), getRightBox(cords), getBelowBox(cords), getLeftBox(cords)]; // at the time of initialization, also buffer the co-ordinates of all adjacent nodes, in the order of motion: top, right, bottom, left
	this.openOptions = []; // array to store more open options, say it moved to top direction and right is also open, store that for using next time, if this path gets blocked in future
	this.restrictedTo = []; // array to store restricted nodes, do not move on this node, this path is verified blocked in an old traversal
}

/*
move to next open node, in the order of motion: top, right, bottom, left
param1::  type: node (mazeBox)
*/
function moveInTRBL(box) {
	coreMaze.markActiveBox(box); // mark this node active
	traverseDirections: // label for breaking loop in b/w
	for (var i = 0; i < coreMaze.motionDirections.length; i++) {
		var direction = coreMaze.motionDirections[i]; // current direction of motion
		var nextBox = null; // variable to store next box under processing (next node object)
		if ( direction && box.adjacentBoxes[i] != null ) { // is there any node in this direction ?
			if ( $('[data-cords="'+box.adjacentBoxes[i]+'"]').attr('data-obj') ) {
				// if the next node is already initialized, get that object, do not re-initialize, save memory
				nextBox = coreMaze.initializedBoxes[$('[data-cords="'+box.adjacentBoxes[i]+'"]').attr('data-obj')];
			} else {
				nextBox = new mazeBox(box.adjacentBoxes[i]); // initialize the next node object
			}
		}
		if (nextBox != null) { // if we have a next node object
			if (
				nextBox.open == "yes" // if next node is open
				&& coreMaze.travelledQueue.indexOf(nextBox) == -1 // if next node is not in current travel queue. This prevents intersections in path
				&& box.restrictedTo.indexOf(nextBox) == -1 // if next node is not restricted to move to. Prevents traversal on old verified blocked paths
				)
			{
					if ( box != coreMaze.prevMazeBox ) { // if a step is taken from current node, do not take same step again. Else buffer the more open options
						coreMaze.takeStep(box); // take the step
						coreMaze.markActiveBox(nextBox); // mark next open box as under processing
						if ( nextBox.xy==coreMaze.exit ) { // if in traversal, exit point is reached ?
							if (window.steps) { clearTimeout(window.steps); } // clear animated steps in ui
							coreMaze.takeStep(nextBox); // take the LAST STEP ! Solution Found !!
							verbose('Solution found. Sending output.');
							coreMaze.travelledQueue.forEach(outPut); // give output in required format, print [x,y] of each node traversed in current successful path
							break traverseDirections; // exit loop, no more traversal required
						}
					} else { // Else buffer the more open options
						box.openOptions.push(nextBox.xy);
					}
			}
		}
		if ( i == (coreMaze.motionDirections.length-1) ) { // if nodes in all directions are checked
			if ( !(box.domElem.attr('data-obj')) ) {
				box.domElem.attr('data-obj',coreMaze.initializedBoxes.length); // this node object is saved at which index in array of maze.initializedBoxes[]
				coreMaze.initializedBoxes.push(box); // now all the open options are buffered, save this node object for future use, This prevents re-initialization in future, saves memory.
			}
			if ( coreMaze.prevMazeBox != box ) { // step not taken yet ?
				if (window.steps) { clearTimeout(window.steps); } // clear animated steps in ui
				coreMaze.takeStep(box); // this node was open but there is no next option, mark the path successful till this node. The optionless nodes will be marked dormant later one by one in reverse traversal
				verbose('This path is blocked, trying new path.');
				tryNewPath(); // in the last iteration of loop, if there is no open path found, its time to try new path to find the solution
			} else { // if a step is taken, re-initialize animated steps in ui
				if (window.steps) { clearTimeout(window.steps); }
				window.steps = setTimeout(stepper,800);
			}
		}
	}
}

function stepper() { // for taking animated steps in ui, after fixed delays
	moveInTRBL(coreMaze.currentMazeBox);
}

/*
Lets try a new path
*/
function tryNewPath() {
	traverseBack:
	while(coreMaze.travelledQueue.length) { // old path is blocked, now if there are nodes in travelled queue, start reverse checking to find nearest node with open options
		var lastOne = coreMaze.travelledQueue.last(); // take last node from traversed path
		if( lastOne.openOptions.length ) { // if that last node have some open options
			if ( coreMaze.lastOneDiscarded!=null ) {
				lastOne.restrictedTo.push(coreMaze.lastOneDiscarded); // in reverse checking, if previous poped node did not had open options, add that to restricted.
			}
			var delIndex = lastOne.openOptions.indexOf(coreMaze.lastOneDiscarded.xy);
			if ( delIndex > -1 ) { // in reverse checking, if previous poped node did not had any open options and it existed in list of open options of current node, remove it from the list, there is no point in going to a node which do not have any open options further.
				lastOne.openOptions.splice(delIndex,1);
			}
			moveInTRBL(lastOne); // if the current poped node have open options to go, lets try that, start checking the new path
			break traverseBack;
		} else {
			coreMaze.popFromQueue(); // pop the last node for reverse checking to find the nearest node with open options
		}
	}
}

/*
All possible paths are blocked. Send output of 'blocked'
*/
function sayBlocked() {
	if (window.steps) { clearTimeout(window.steps); }
	verbose('All possible paths are blocked. Sending output.');
	outPut('blocked');
}

/*
Print verbose at ui
*/
function verbose(text) {
	$('.js-verbose').append('<p>'+text+'</p>').scrollTop('1000');
}

/*
Print output at ui
*/
function outPut(msg) {
	if( msg.xy != undefined ){
		$('.js-output').append('<p>'+msg.xy+'</p>');
	} else {
		$('.js-output').append('<p>'+msg+'</p>');
	}
}


// ----------------------------------------------------------------------
// Below code is for plotting diviers, it is not used in solving the maze
// ----------------------------------------------------------------------
$('.js-go').click(function(){
	if ( $(this).is('.non-func') ) { return true; }
	var inpVal = $('.js-inp').val();
	if (inpVal=="") {
		verbose('No input recieved, no dividers added, solving maze without any new divider. You can add new dividers in format [2,2]:[2,3];[2,2]:[3,2].')
		startSolving();
		return true;
	}
	var newDividersCords = $.trim(inpVal);
	if ( newDividersCords == "" || newDividersCords == undefined ) {
		verbose("That input is not correct. Please use format [2,2]:[2,3];[2,2]:[3,2]");
	} else {
		plotNewDividers(newDividersCords);
	}
});

window.dividersCreated = 0
function plotNewDividers(cords) { // input in format "[2,2]:[2,3];[2,2]:[3,2]"
	var dividers = cords.split(";"); // dividers = ["[2,2]:[2,3]", "[2,2]:[3,2]"]
	traverseDividers:
	for (var i = dividers.length - 1; i >= 0; i--) {
		var dividerEnds = dividers[i].split(":"); // dividerEnds = ["[2,2]", "[2,3]"]
		var dividerStart = dividerEnds[0]; // "[2,2]"
		var dividerEnd = dividerEnds[1]; // "[2,3]"

		if ( dividerEnds.length != 2 || $.trim(dividerStart) == "" || $.trim(dividerEnd) == "" ) {
			verbose("That input is not correct. Co-ordinates can not be blank and there can be only two set of them.");
			break traverseDividers;
		} else {
			try {
				var dividerStartArray = JSON.parse(dividerStart); // "[2,2]" is now [2,2]
				var dividerEndArray = JSON.parse(dividerEnd); // "[2,3]" is now [2,3]
			}
			catch (e) {
				verbose("That input is not correct. Error in parsing Co-ordinates.");
				break traverseDividers;
			}
			if ( dividerStartArray.length != 2 || dividerEndArray.length != 2 ) {
				verbose("That input is not correct. There can not be more than two Co-ordinates in a set.");
				break traverseDividers;
			} else {
				if ( dividerStartArray.some(checkPointValue) || dividerEndArray.some(checkPointValue) ) {
					verbose("That input is not correct. Point value should be a number greater than or equal to zero and less than or equal to 4.");
					break traverseDividers;
				} else {
					var inEqualX = dividerStartArray[0] != dividerEndArray[0];
					var inEqualY = dividerStartArray[1] != dividerEndArray[1];
					if ( inEqualX && inEqualY ) {
						verbose("That input is not correct. Diaognal or L shaped dividers are not possible.");
						break traverseDividers;
					} else {
						if (inEqualY) { var traverseOnAxis = 1; } else { var traverseOnAxis = 0; }
						if (dividerStartArray[traverseOnAxis] < dividerEndArray[traverseOnAxis]){
							var loopStart = dividerStartArray[traverseOnAxis];
							var loopEnd = dividerEndArray[traverseOnAxis];
						} else {
							var loopStart = dividerEndArray[traverseOnAxis];
							var loopEnd = dividerStartArray[traverseOnAxis];
						}
						traverseBoxes:
						for (var d = loopStart; d <= loopEnd; d++) {
							if (inEqualY) {
								blockPath("["+dividerStartArray[0]+","+d+"]");
							} else {
								blockPath("["+d+","+dividerStartArray[1]+"]");
							}
							if (d==loopEnd) { dividersCreated=dividersCreated+1; }
						}
					}
				}
			}
		}
		if ( dividersCreated == dividers.length ) {
			startSolving();
		}
	}
}

function checkPointValue(element, index, array) {
	if( element == undefined || $.trim(element) == "" || (typeof element) != "number" ) {
		return true;
	}
}

function blockPath(cords) {
	var selectorString = '[data-cords="'+cords+'"]'
	$(selectorString).attr('data-divider','yes').attr('data-path-open','no');
}

function startSolving() {
	window.mz = new mazeBox(coreMaze.entry);
	moveInTRBL(mz);
	$('.js-go').addClass('non-func');
}