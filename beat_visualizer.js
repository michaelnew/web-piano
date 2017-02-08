
function BeatVisualizer(stage) {
	this.stage = stage;
	this.channels = [];
}

BeatVisualizer.prototype.tick = function(time) {
    for (let i = 0, c; c = this.channels[i]; i++) {
		c.tick(time);
	}
}

BeatVisualizer.prototype.addChannel = function(x) {
	let channel = new BeatChannel(x, this.stage);
	this.channels.push(channel);

	this.stage.addChild(channel.shape);

	return channel;
}

function BeatChannel(x, stage) {
	this.stage = stage;
	this.shape = new createjs.Shape();

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
			this.nodes.push(node);

			this.stage.addChild(node.shape);
		}
	}
}

BeatChannel.prototype.tick = function(time) {
    for (let i = 0, n; n = this.nodes[i]; i++) {
		n.tick(time);
	}
}

function BeatNode(x) {
	this.shape = new createjs.Shape();
	this.startBeat = 0; 
	this.endBeat = 3;

	this.shape.x = x + 1.5;
	this.shape.y = nodeRadius;
	this.shape.graphics.clear().beginFill(BEAT_NODE).drawCircle(0, 0, nodeRadius).endFill();
}

BeatNode.prototype.tick = function(time) {
	this.shape.y = (time - this.startBeat) * pixelsPerBeat;
	if (this.shape.y / pixelsPerBeat > this.endBeat - this.startBeat) {
		let length = this.endBeat - this.startBeat;
		this.startBeat += length;
		this.endBeat += length;
	}
}
