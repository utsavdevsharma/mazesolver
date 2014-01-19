function maze() {
	this.mazeSize = 5;
	this.travelledQueue = [];
	this.prevMazeBox = null;
	this.currentMazeBox = null;
	this.motionDirections = ['top','right','bottom','left'];
}
maze.prototype.pushInQueue = function(prevMazeBox) {
	this.travelledQueue.push(this.prevMazeBox);
};
maze.prototype.popFromQueue = function() {
	this.travelledQueue.pop();
};
maze.prototype.markActiveBox = function(box) {
	box.domElem.attr("data-checking","yes");
	defMaze.currentMazeBox = box;
};
maze.prototype.markChecked = function(box) {
	box.domElem.removeAttr("data-checking");
};
maze.prototype.takeStep = function(box) {
	defMaze.markChecked(box);
	box.domElem.attr("data-solved","yes");
};
var defMaze = new maze();

function getAboveBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[1] = cordsArray[1]+1;
	if (cordsArray[1]<defMaze.mazeSize) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function getBelowBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[1] = cordsArray[1]-1;
	if (cordsArray[1]>0) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function getRightBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[0] = cordsArray[0]+1;
	if (cordsArray[0]<defMaze.mazeSize) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function getLeftBox(cords) {
	var cordsArray = JSON.parse(cords);
	cordsArray[0] = cordsArray[0]-1;
	if (cordsArray[0]>0) { return "["+cordsArray.toString()+"]"; } else { return null; }
}

function mazeBox(cords) {
	// this.cords = JSON.parse(cords);
	this.domElem = $('[data-cords="'+cords+'"]');
	this.open = this.domElem.attr('data-path-open');
	this.aboveBoxCords = getAboveBox(cords);
	this.rightBox = getRightBox(cords);
	this.belowBox = getBelowBox(cords);
	this.leftBox = getLeftBox(cords);
}

function moveInTRBL(box) {
	defMaze.markActiveBox(box);
	traverseDirections:
	for (var i = 0; i < defMaze.motionDirections.length; i++) {
		var direction = defMaze.motionDirections[i];
		if (direction=='top' && box.aboveBoxCords) {
			var nextBox = new mazeBox(box.aboveBoxCords);
			defMaze.markActiveBox(nextBox);
			if (defMaze.currentMazeBox.open=="yes") {
				defMaze.takeStep(box);
				break traverseDirections;
			} else {
				defMaze.markChecked(nextBox);
				defMaze.markActiveBox(box);
			}
		}
	}
}

// Below code is for plotting diviers, not used in solving maze
$('.js-go').click(function(){
	var newDividersCords = $.trim($('.js-inp').val());
	if ( newDividersCords == "" || newDividersCords == undefined ) {
		alert("That input is not correct. Please use format [2,2]:[2,3];[2,2]:[3,2]");
	} else {
		plotNewDividers(newDividersCords);
	}
});

function plotNewDividers(cords) { // input in format "[2,2]:[2,3];[2,2]:[3,2]"

	var dividers = cords.split(";"); // dividers = ["[2,2]:[2,3]", "[2,2]:[3,2]"]
	traverseDividers:
	for (var i = dividers.length - 1; i >= 0; i--) {
		// console.log("Plotting Divider "+dividers[i]);

			var dividerEnds = dividers[i].split(":"); // dividerEnds = ["[2,2]", "[2,3]"]
			var dividerStart = dividerEnds[0]; // "[2,2]"
			var dividerEnd = dividerEnds[1]; // "[2,3]"

			if ( dividerEnds.length != 2 || $.trim(dividerStart) == "" || $.trim(dividerEnd) == "" ) {
				alert("That input is not correct. Co-ordinates can not be blank and there can be only two set of them.");
				break traverseDividers;
			} else {
				try {
					var dividerStartArray = JSON.parse(dividerStart); // "[2,2]" is now [2,2]
					var dividerEndArray = JSON.parse(dividerEnd); // "[2,3]" is now [2,3]
				}
				catch (e) {
					alert("That input is not correct. Error in parsing Co-ordinates.");
					break traverseDividers;
				}
				if ( dividerStartArray.length != 2 || dividerEndArray.length != 2 ) {
					alert("That input is not correct. There can not be more than two Co-ordinates in a set.");
					break traverseDividers;
				} else {
					if ( dividerStartArray.some(checkPointValue) || dividerEndArray.some(checkPointValue) ) {
						alert("That input is not correct. Point value should be a number greater than or equal to zero and less than or equal to 4.");
						break traverseDividers;
					} else {
						var inEqualX = dividerStartArray[0] != dividerEndArray[0];
						var inEqualY = dividerStartArray[1] != dividerEndArray[1];
						// console.log("inEqualX "+inEqualX+" inEqualY "+inEqualY);
						if ( inEqualX && inEqualY ) {
							alert("That input is not correct. Diaognal or L shaped dividers are not possible.");
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
							}
						}
					}
				}
			}
	};
}

function checkPointValue(element, index, array) {
	if( element == undefined || $.trim(element) == "" || (typeof element) != "number" ) {
		return true;
	}
}

function blockPath(cords) {
	// console.log(cords);
	var selectorString = '[data-cords="'+cords+'"]'
	$(selectorString).attr('data-divider','yes');
}