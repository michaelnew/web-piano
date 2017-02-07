
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
}

function BeatChannel(x, stage) {
	this.shape = new createjs.Shape();

	x = x - beatLineWidth * .5;

	this.nodes = [];

	this.shape.x = x;
	this.shape.y = yOffset - beatLineHeight;
	this.shape.graphics.clear().beginFill("#FF5657").drawRect(0, 0, beatLineWidth, beatLineHeight).endFill();

	let node = new BeatNode(x);
	this.nodes.push(node);

	stage.addChild(node.shape);

	node = new BeatNode(x);
	node.startBeat = .5;
	this.nodes.push(node);

	stage.addChild(node.shape);
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
	this.shape.graphics.clear().beginFill("#FF5657").drawCircle(0, 0, nodeRadius).endFill();
}

BeatNode.prototype.tick = function(time) {
	this.shape.y = (time - this.startBeat) * pixelsPerBeat;
	if (this.shape.y / pixelsPerBeat > this.endBeat - this.startBeat) {
		let length = this.endBeat - this.startBeat;
		this.startBeat += length;
		this.endBeat += length;
	}
}
