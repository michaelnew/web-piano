
function BeatVisualizer(stage, triggerCallback) {
	this.stage = stage;
	this.triggerCallback = triggerCallback;
	this.channels = [];
}

BeatVisualizer.prototype.tick = function(time) {
    for (let i = 0, c; c = this.channels[i]; i++) {
		c.tick(time);
	}
}

BeatVisualizer.prototype.addChannel = function(x, triggerPointY, note) {
	let channel = new BeatChannel(x, triggerPointY, note, this.triggerCallback, this.stage);
	this.channels.push(channel);

	this.stage.addChild(channel.shape);

	return channel;
}


BeatVisualizer.prototype.addNodeToChannel = function(note, time) {
	let matchingChannel;
    for (let i = 0, c; c = this.channels[i]; i++) {
		if (c.note == note) {
			matchingChannel = c;
		}
	}
	if (matchingChannel) {
		matchingChannel.addNodeAtTime(time);
	}
}

function BeatChannel(x, triggerPointY, note, triggerCallback, stage) {
	this.stage = stage;
	this.shape = new createjs.Shape();
	this.note = note;
	this.triggerCallback = triggerCallback;

	x = x - beatLineWidth * .5;

	this.nodes = [];

	this.shape.x = x;
	this.shape.y = yOffset - beatLineHeight;
	this.shape.graphics.clear().beginFill(BEAT_LINE).drawRect(0, 0, beatLineWidth, beatLineHeight).endFill();
}

BeatChannel.prototype.addSubdividedNodes = function(subdivisions) {
	for (let b = 0; b < beatsPerNode; b++) {
		for (let i = 0; i < subdivisions; i++) {

			let x = this.shape.x;

			let node = new BeatNode(x);
			node.startBeat = i/subdivisions + b;
			node.endBeat = 3 + i/subdivisions + b;
			node.repeat = true;
			this.nodes.push(node);

			this.stage.addChild(node.shape);
		}
	}
}

BeatChannel.prototype.tick = function(time) {
    for (let i = 0, n; n = this.nodes[i]; i++) {
		//n.tick(time);

		n.shape.y = (time - n.startBeat) * pixelsPerBeat;

		if (n.shape.y / pixelsPerBeat > 1.5  && !n.triggered) {
			n.triggered = true;
			this.triggerCallback(this.note);
			n.shape.graphics.clear().beginFill(BEAT_NODE_TRIGGERED).drawCircle(0, 0, nodeRadius).endFill();
		}

		if (n.shape.y / pixelsPerBeat > n.endBeat - n.startBeat) {
			if (n.repeat) {
				let length = n.endBeat - n.startBeat;
				n.startBeat += length;
				n.endBeat += length;
				n.triggered = false;
				n.shape.graphics.clear().beginFill(BEAT_NODE).drawCircle(0, 0, nodeRadius).endFill();
			} else {
				this.stage.removeChild(n.shape);
				this.nodes.splice(i, 1);
				i -= 1;
				console.log("destroy note!!!");
			}
		}
	}
}

BeatChannel.prototype.addNodeAtTime = function(time) {

	let node = new BeatNode(this.shape.x);
	let t = time - yOffset / pixelsPerBeat;
	node.startBeat = t;
	node.endBeat = t + 3;
	this.nodes.push(node);

	this.stage.addChild(node.shape);
}

function BeatNode(x) {
	this.shape = new createjs.Shape();
	this.startBeat = 0; 
	this.endBeat = 3;
	this.triggered = false;
	this.repeat = false;

	this.shape.x = x + 1.5;
	this.shape.y = nodeRadius;
	this.shape.graphics.clear().beginFill(BEAT_NODE).drawCircle(0, 0, nodeRadius).endFill();
}
