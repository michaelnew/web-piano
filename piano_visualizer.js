const xOffset = 0;
const yOffset = 100;

const keyWidth = 30;
const keyHeight = 130;
const keyGap = 2;
const keyCornerRadius = 9;

const blackNotes = [22,25,27,30,32,34,37,39,42,44,46,49,51,54,56,58,61,63,66,68,70,73,75,78,80,82,85,87,90,92,94,97,99,102,104,106];

function PianoVisualizer(stage) {
	this.stage = stage;

	this.keyMap = {};
	this.generateKeys(45, 75);
}

PianoVisualizer.prototype.toggleKey = function(note, on) {
	var k = this.keyMap[note];
	if (k) {
		k.toggle(on);
		this.stage.update();
	} else {
		console.log("key not found for " + note);
	}
}

PianoVisualizer.prototype.generateKeys = function(start, end) {
	var p = 0;
	for (var i = start; i <= end; i++) {

		var isBlack = blackNotes.indexOf(i) > -1;

		var k = new key(p, isBlack);
		this.stage.addChild(k.keyShape);

		this.keyMap[i] = k;

		this.toggleKey(i, false);
		if (!isBlack) p++;
	}
	console.log(this.keyMap);
}


function key(position, isBlack) {
	this.isBlack = isBlack;

	this.keyShape = new createjs.Shape();
	this.keyShape.x = xOffset + (position * (keyWidth + keyGap));
	this.keyShape.y = yOffset;
}

key.prototype.toggle = function(on) {
	// use #55573 for black keys
	const r = keyCornerRadius;
	if (this.isBlack) {
		if (on) {
			this.keyShape.graphics.clear().beginStroke("#282").beginFill("#3BBFC0").drawRoundRectComplex(0, 0, keyWidth*.6, keyHeight*.6, 0,0,r,r).endFill().endStroke();
		} else {
			this.keyShape.graphics.clear().beginStroke("#222").beginFill("#4B4D49").drawRoundRectComplex(0, 0, keyWidth*.6, keyHeight*.6, 0,0,r,r).endFill().endStroke();
		}
	} else {
		if (on) {
			this.keyShape.graphics.clear().beginStroke("#282").beginFill("#3BBFC0").drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill().endStroke();
		} else {
			this.keyShape.graphics.clear().beginStroke("#222").beginFill("#FFF").drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill().endStroke();
		}
	}
}
