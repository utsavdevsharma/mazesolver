Array.prototype.last = function() {
	return this.slice(-1)[0];
}

function maze() {
	this.entry = "[0,1]";
	this.exit = "[4,3]";
	this.mazeSize = 5;
	this.travelledQueue = [];
	this.prevMazeBox = null;
	this.currentMazeBox = null;
	this.motionDirections = ['top','right','bottom','left'];
	this.initializedBoxes = [];
	this.lastOneDiscarded = null;
	this.stillHaveSomePaths = true;
}
maze.prototype.pushInQueue = function() {
	if ( this.travelledQueue.last() != this.prevMazeBox ) {
		this.travelledQueue.push(this.prevMazeBox);
	}
};
maze.prototype.popFromQueue = function() {
	this.lastOneDiscarded = this.travelledQueue.pop();
	this.lastOneDiscarded.domElem.removeAttr('data-solved').attr('data-dormant','');
};
maze.prototype.markActiveBox = function(box) {
	box.domElem.attr("data-checking","yes");
	this.currentMazeBox = box;
};
maze.prototype.markChecked = function(box) {
	box.domElem.removeAttr("data-checking");
};
maze.prototype.takeStep = function(box) {
	verbose(box.xy);
	this.markChecked(box);
	this.prevMazeBox = box;
	this.pushInQueue();
	box.domElem.attr("data-solved","yes");
};
window.coreMaze = new maze();

function getAboveBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[1] = cordsArray[1]+1;
	if (cordsArray[1]<coreMaze.mazeSize) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function getBelowBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[1] = cordsArray[1]-1;
	if (cordsArray[1]>=0) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function getRightBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[0] = cordsArray[0]+1;
	if (cordsArray[0]<coreMaze.mazeSize) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function getLeftBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[0] = cordsArray[0]-1;
	if (cordsArray[0]>=0) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function mazeBox(cords) {
	this.xy = cords;
	this.domElem = $('[data-cords="'+cords+'"]');
	this.open = this.domElem.attr('data-path-open');
	this.adjacentBoxes = [getAboveBox(cords), getRightBox(cords), getBelowBox(cords), getLeftBox(cords)];
	this.openOptions = [];
	this.restrictedTo = [];
}

function moveInTRBL(box) {
	coreMaze.markActiveBox(box);
	traverseDirections:
	for (var i = 0; i < coreMaze.motionDirections.length; i++) {
		var direction = coreMaze.motionDirections[i];
		var nextBox = null;
		if ( direction && box.adjacentBoxes[i] != null ) {
			if ( $('[data-cords="'+box.adjacentBoxes[i]+'"]').attr('data-obj') ) {
				nextBox = coreMaze.initializedBoxes[$('[data-cords="'+box.adjacentBoxes[i]+'"]').attr('data-obj')];
			} else {
				nextBox = new mazeBox(box.adjacentBoxes[i]);
			}
		}
		if (nextBox != null) {
			if (
				nextBox.open == "yes"
				&& coreMaze.travelledQueue.indexOf(nextBox) == -1
				&& box.restrictedTo.indexOf(nextBox) == -1 
				)
			{
					if ( box != coreMaze.prevMazeBox ) {
						coreMaze.takeStep(box);
						coreMaze.markActiveBox(nextBox);
						if ( nextBox.xy==coreMaze.exit ) {
							if (window.steps) { clearTimeout(window.steps); }
							coreMaze.takeStep(nextBox);
							verbose('Solution found');
							outPut(coreMaze.travelledQueue);
							break traverseDirections;
						}
					} else {
						box.openOptions.push(nextBox.xy);
					}
			}
		}
		if ( i == (coreMaze.motionDirections.length-1) ) {
			if ( !(box.domElem.attr('data-obj')) ) {
				box.domElem.attr('data-obj',coreMaze.initializedBoxes.length);
				coreMaze.initializedBoxes.push(box);
			}
			if ( coreMaze.prevMazeBox != box ) {
				if (window.steps) { clearTimeout(window.steps); }
				// console.log("clearTimeout");
				coreMaze.takeStep(box);
				verbose('This path is blocked, trying new path.');
				tryNewPath();
			} else {
				if (window.steps) { clearTimeout(window.steps); }
				window.steps = setTimeout(stepper,800);
			}
		}
	}
}

function stepper() {
	moveInTRBL(coreMaze.currentMazeBox);
}

function tryNewPath() {
	// coreMaze.popFromQueue();
	coreMaze.stillHaveSomePaths = false;
	traverseBack:
	while(coreMaze.travelledQueue.length) {
		var lastOne = coreMaze.travelledQueue.last();
		if( lastOne.openOptions.length ) {
			// console.log("lastOne");
			// console.log(coreMaze.lastOneDiscarded);
			if ( coreMaze.lastOneDiscarded!=null ) {
				lastOne.restrictedTo.push(coreMaze.lastOneDiscarded);
			}
			console.log(lastOne.xy,lastOne.openOptions,coreMaze.lastOneDiscarded.xy);
			var delIndex = lastOne.openOptions.indexOf(coreMaze.lastOneDiscarded.xy);
			if (delIndex>-1) { lastOne.openOptions.splice(delIndex,1); }
			console.log(lastOne.xy,lastOne.openOptions,delIndex,coreMaze.travelledQueue);
			coreMaze.stillHaveSomePaths = true;
			moveInTRBL(lastOne);
			break traverseBack;
		} else {
			// console.log("lastOnepoped");
			coreMaze.popFromQueue();
		}
	}
	setTimeout(sayBlocked,10000);
}

function sayBlocked() {
	if (!coreMaze.stillHaveSomePaths) {
		if (window.steps) { clearTimeout(window.steps); }
		verbose('all possible paths blocked');
		outPut('blocked');
	}
}

function verbose(text) {
	$('.js-verbose').append('<p>'+text+'</p>').scrollTop('1000');
}

function outPut(msg) {
	$('.js-output').append('<p>'+msg+'</p>');
}

// ------------------------------------------------------------
// Below code is for plotting diviers, not used in solving maze
// ------------------------------------------------------------
$('.js-go').click(function(){
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
		// console.log("Plotting Divider "+dividers[i]);
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
					// console.log("inEqualX "+inEqualX+" inEqualY "+inEqualY);
					if ( inEqualX && inEqualY ) {
						verbose("That input is not correct. Diaognal or L shaped dividers are not possible.");
						break traverseDividers;
					} else {
						if (inEqualY) { var traverseOnAxis = 1; } else { var traverseOnAxis = 0; }
						// console.log("traverseOnAxis "+traverseOnAxis);
						if (dividerStartArray[traverseOnAxis] < dividerEndArray[traverseOnAxis]){
							var loopStart = dividerStartArray[traverseOnAxis];
							var loopEnd = dividerEndArray[traverseOnAxis];
						} else {
							var loopStart = dividerEndArray[traverseOnAxis];
							var loopEnd = dividerStartArray[traverseOnAxis];
						}
						// console.log("loopStart "+loopStart);
						// console.log("loopEnd "+loopEnd);
						traverseBoxes:
						for (var d = loopStart; d <= loopEnd; d++) {
							// console.log(d);
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
		// console.log(dividersCreated,dividers.length);
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
	// console.log(cords);
	var selectorString = '[data-cords="'+cords+'"]'
	$(selectorString).attr('data-divider','yes').attr('data-path-open','no');
}

function startSolving() {
	window.mz = new mazeBox(coreMaze.entry);
	moveInTRBL(mz);
	// $('.js-go').attr('disabled','disabled')
}