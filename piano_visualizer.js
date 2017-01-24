function PianoVisualizer(stage) {
	this.stage = stage;

	var k = new key(57, 0, this.stage);
	this.keyMap = {"57": k};

	this.toggleKey(57, false);
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


function key(code, position, stage) {
	this.code = code;

	this.keyShape = new createjs.Shape();
	this.keyShape.x = 100;
	this.keyShape.y = 100;

	stage.addChild(this.keyShape);
}

key.prototype.toggle = function(on) {
	// use #55573 for black keys
	if (on) {
		this.keyShape.graphics.clear().beginStroke("#282").beginFill("#3BBFC0").drawRoundRectComplex(0, 0, 50, 200, 5,5,5,5).endFill().endStroke();
	} else {
		this.keyShape.graphics.clear().beginStroke("#222").beginFill("#FFF").drawRoundRectComplex(0, 0, 50, 200, 5,5,5,5).endFill().endStroke();
	}
}
