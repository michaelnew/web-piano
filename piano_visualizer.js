const xOffset = 0;
const yOffset = 100;

const keyWidth = 30;
const keyHeight = 130;
const keyGap = 3;
const keyCornerRadius = 9;

const blackKeyWidth = 18*1.1;
const blackKeyHeight = 80*1.1;
const blackKeyCornerRadius = 6;

const blackNotes = [22,25,27,30,32,34,37,39,42,44,46,49,51,54,56,58,61,63,66,68,70,73,75,78,80,82,85,87,90,92,94,97,99,102,104,106];

function PianoVisualizer(stage) {
	this.stage = stage;

	this.keyMap = {};
	this.generateKeys(43, 86);
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
	var blackKeys = [];
	for (var i = start; i <= end; i++) {

		var isBlack = blackNotes.indexOf(i) > -1;

		if (isBlack) p--;

		var k = new key(p, isBlack);
		this.stage.addChild(k.keyShape);

		if (isBlack) {
			blackKeys.push(k);
		}

		this.keyMap[i] = k;

		this.toggleKey(i, false);
		p++;
	}

	console.log(this.keyMap);

    for (var i = 0, k; k = blackKeys[i]; i++) {
		console.log(k);
		this.stage.setChildIndex(k.keyShape, this.stage.getNumChildren()-1);
		this.stage.update();
	}
}


function key(position, isBlack) {
	this.isBlack = isBlack;

	this.keyShape = new createjs.Shape();
	if (isBlack) {
		let extraOffset = (keyWidth + keyGap * .5) - blackKeyWidth * .5;
		this.keyShape.x = xOffset + (position * (keyWidth + keyGap)) + extraOffset;
		this.keyShape.y = yOffset - keyGap * .5;
	} else {
		this.keyShape.x = xOffset + (position * (keyWidth + keyGap));
		this.keyShape.y = yOffset;
	}
}

key.prototype.toggle = function(on) {

	const r = keyCornerRadius;
	const br = blackKeyCornerRadius;

	if (this.isBlack) {
		if (on) {
			this.keyShape.graphics.clear().setStrokeStyle(keyGap).beginStroke("#222").beginFill("#3BBFC0").drawRoundRectComplex(0, 0, blackKeyWidth, blackKeyHeight, 0,0,br,br).endFill().endStroke();
		} else {
			this.keyShape.graphics.clear().setStrokeStyle(keyGap).beginStroke("#222").beginFill("#4B4D49").drawRoundRectComplex(0, 0, blackKeyWidth, blackKeyHeight, 0,0,br,br).endFill().endStroke();
		}
	} else {
		if (on) {
			this.keyShape.graphics.clear().beginFill("#3BBFC0").drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill();
		} else {
			this.keyShape.graphics.clear().beginFill("#FFF").drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill();
		}
	}
}
