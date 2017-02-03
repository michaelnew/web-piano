const xOffset = 0;
const yOffset = 250;

const keyWidth = 30;
const keyHeight = 130;
const keyGap = 3;
const keyCornerRadius = 9;

const blackKeyWidth = 18*1.1;
const blackKeyHeight = 80*1.1;
const blackKeyCornerRadius = 6;

const blackNotes = [22,25,27,30,32,34,37,39,42,44,46,49,51,54,56,58,61,63,66,68,70,73,75,78,80,82,85,87,90,92,94,97,99,102,104,106];

const pixelsPerBeat = 300;

const nodeRadius = 6;

const beatLineHeight = 300;
const beatLineWidth = 3;


function PianoVisualizer(stage) {
	this.stage = stage;

	this.keyMap = {};
	this.generateKeys(41, 100);
	this.showLabels(4, 3);

	let line = new beatLine(this.keyMap[58]);
	this.stage.addChild(line.shape);

	let line2 = new beatLine(this.keyMap[78]);
	this.stage.addChild(line2.shape);

	let node = new beatNode(line2);
	this.tempNode = node;
	this.stage.addChild(node.shape);

	this.stage.update();
}


PianoVisualizer.prototype.tick = function(time) {
	this.tempNode.shape.y = time * pixelsPerBeat;
}

PianoVisualizer.prototype.getCanvasWidth = function() {
	return this.stage.canvas.width / this.stage.scaleX;
}

PianoVisualizer.prototype.showLabels = function(left, right) {
	let container = new createjs.Container();
	const width = 200;
	const y = 560
	const fontSize = "130px"

	let text = new createjs.Text(left.toString(), "100 " + fontSize + " Roboto", "#D2CFCE");
	text.textBaseline = "alphabetic";
	container.addChild(text);

	text = new createjs.Text(":", "100 " + fontSize + " Roboto", "#D2CFCE");
	text.textBaseline = "alphabetic";
	text.x = 90; 
	text.y = -6;
	container.addChild(text);

	text = new createjs.Text(right.toString(), "100 " + fontSize + " Roboto", "#D2CFCE");
	text.textBaseline = "alphabetic";
	text.x = 130;
	container.addChild(text);

	container.x = this.getCanvasWidth() * .5 - width *.5;
	container.y = y;
	this.stage.addChild(container);
	this.stage.update();
}

PianoVisualizer.prototype.toggleKey = function(note, on) {
	let k = this.keyMap[note];
	if (k) {
		k.toggle(on);
		this.stage.update();
	} else {
		console.log("key not found for " + note);
	}
}

PianoVisualizer.prototype.generateKeys = function(start, end) {
	let p = 0;
	let blackKeys = [];
	for (let i = start; i <= end; i++) {

		let isBlack = blackNotes.indexOf(i) > -1;

		if (isBlack) p--;

		let k = new key(p, isBlack);
		this.stage.addChild(k.keyShape);

		if (isBlack) {
			blackKeys.push(k);
		}

		this.keyMap[i] = k;

		this.toggleKey(i, false);
		p++;
	}

	//console.log(this.keyMap);

    for (let i = 0, k; k = blackKeys[i]; i++) {
		console.log(k);
		this.stage.setChildIndex(k.keyShape, this.stage.getNumChildren()-1);
		this.stage.update();
	}
}

function beatLine(key) {
	this.shape = new createjs.Shape();

	let kw = key.isBlack ? blackKeyWidth : keyWidth;

	this.shape.x = key.keyShape.x + kw * .5 - beatLineWidth * .5;
	this.shape.y = yOffset - beatLineHeight;
	this.shape.graphics.clear().beginFill("#FF5657").drawRect(0, 0, beatLineWidth, beatLineHeight).endFill();
}

function beatNode(line) {
	this.shape = new createjs.Shape();

	this.shape.x = line.shape.x + 1.5;
	this.shape.y = nodeRadius;
	this.shape.graphics.clear().beginFill("#FF5657").drawCircle(0, 0, nodeRadius).endFill();
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
