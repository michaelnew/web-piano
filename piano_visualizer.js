
function PianoVisualizer(stage) {
	this.stage = stage;

	this.keyMap = {};
	this.generateKeys(41, 100);

	this.showLabels(4, 3);
	this.stage.update();
}

// this should go into some kind of helper class
PianoVisualizer.prototype.getCanvasWidth = function() {
	return this.stage.canvas.width / this.stage.scaleX;
}

PianoVisualizer.prototype.topCenterForKey = function(note) {
	let k = this.keyMap[note];
	let p = 0;
	if (k) {
		let w = k.isBlack ? blackKeyWidth * .5 : keyWidth * .5;
		p = k.shape.x + w;
	} else {
		console.log("key not found for " + note);
	}
	return p;
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
		this.stage.addChild(k.shape);

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
		this.stage.setChildIndex(k.shape, this.stage.getNumChildren()-1);
		this.stage.update();
	}
}

function key(position, isBlack) {
	this.isBlack = isBlack;
	this.durationInBeats = 3;
	this.currentBeat = 0;

	this.shape = new createjs.Shape();
	if (isBlack) {
		let extraOffset = (keyWidth + keyGap * .5) - blackKeyWidth * .5;
		this.shape.x = xOffset + (position * (keyWidth + keyGap)) + extraOffset;
		this.shape.y = yOffset - keyGap * .5;
	} else {
		this.shape.x = xOffset + (position * (keyWidth + keyGap));
		this.shape.y = yOffset;
	}
}

key.prototype.toggle = function(on) {

	const r = keyCornerRadius;
	const br = blackKeyCornerRadius;

	if (this.isBlack) {
		if (on) {
			this.shape.graphics.clear().setStrokeStyle(keyGap).beginStroke("#222").beginFill(TRIGGERED_KEY_BLACK).drawRoundRectComplex(0, 0, blackKeyWidth, blackKeyHeight, 0,0,br,br).endFill().endStroke();
		} else {
			this.shape.graphics.clear().setStrokeStyle(keyGap).beginStroke("#222").beginFill("#4B4D49").drawRoundRectComplex(0, 0, blackKeyWidth, blackKeyHeight, 0,0,br,br).endFill().endStroke();
		}
	} else {
		if (on) {
			this.shape.graphics.clear().beginFill(TRIGGERED_KEY_WHITE).drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill();
		} else {
			this.shape.graphics.clear().beginFill("#FFF").drawRoundRectComplex(0, 0, keyWidth, keyHeight, 0,0,r,r).endFill();
		}
	}
}
