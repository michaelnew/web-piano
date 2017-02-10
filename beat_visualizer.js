
function BeatVisualizer(stage, triggerCallback) {
	this.stage = stage;
	this.triggerCallback = triggerCallback;
	this.channels = [];
	this.snapPoints = [];
}

BeatVisualizer.prototype.tick = function(time) {
    for (let i = 0, c; c = this.channels[i]; i++) {
		c.tick(time);
	}
}

BeatVisualizer.prototype.addChannel = function(x, triggerPointY, note) {
	let channel = new BeatChannel(x, triggerPointY, note, this.triggerCallback, this.stage);

	if (this.snapPoints) { channel.snapPoints = this.snapPoints; }

	this.channels.push(channel);
	this.stage.addChild(channel.shape);

	return channel;
}

BeatVisualizer.prototype.setChannelSnapPoints = function(snapPoints) {
	this.snapPoints = snapPoints;
    for (let c in this.channels) {
		c.snapPoints = this.snapPoints;
	}
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
	this.snapPoints = [];

	x = x - beatLineWidth * .5;

	this.nodes = [];

	this.shape.x = x;
	this.shape.y = yOffset - beatLineHeight;
	this.shape.graphics.clear().beginFill(BEAT_LINE).drawRect(0, 0, beatLineWidth, beatLineHeight).endFill();

	let c = this;
	this.shape.on("pressmove", function(evt) {
		evt.target.x = evt.stageX;
	});

	this.shape.on("pressup", function(evt) {
		c.snapToNearestPoint();
	});
}

BeatChannel.prototype.snapToNearestPoint = function() {
	let nearestDistance  = 10000000;
	let nearestPoint = 0;

	let x = this.shape.x + beatLineWidth * .5;

    for (let i = 0, p; p = this.snapPoints[i]; i++) {
		let diff = x - p;
		diff = Math.abs(diff);
		if (diff < nearestDistance) {
			nearestDistance = diff;
			nearestPoint = p;
		}
	}

	console.log(nearestPoint);
	this.shape.x = nearestPoint - beatLineWidth * .5;
}

BeatChannel.prototype.getCenterX = function() {
	return this.shape.x + beatLineWidth * .5;
}


BeatChannel.prototype.addSubdividedNodes = function(subdivisions) {
	for (let b = 0; b < beatsPerNode; b++) {
		for (let i = 0; i < subdivisions; i++) {

			let x = this.shape.x + beatLineWidth * .5;

			let node = new BeatNode(x);
			node.startBeat = i/subdivisions + b;
			node.endBeat = 3 + i/subdivisions + b;
			node.repeat = true;
			node.normalColor = BEAT_NODE;
			node.triggeredColor = BEAT_NODE_TRIGGERED;

			this.nodes.push(node);
			this.stage.addChild(node.shape);
		}
	}
}

BeatChannel.prototype.tick = function(time) {
    for (let i = 0, n; n = this.nodes[i]; i++) {
		//n.tick(time);

		n.shape.y = (time - n.startBeat) * pixelsPerBeat;
		n.shape.x = this.shape.x + beatLineWidth * .5;

		if (n.shape.y / pixelsPerBeat > 1.5  && !n.triggered) {
			n.triggered = true;
			this.triggerCallback(this.note);
			n.shape.graphics.clear().beginFill(n.triggeredColor).drawCircle(0, 0, nodeRadius).endFill();
		}

		if (n.shape.y / pixelsPerBeat > n.endBeat - n.startBeat) {
			if (n.repeat) {
				let length = n.endBeat - n.startBeat;
				n.startBeat += length;
				n.endBeat += length;
				n.triggered = false;
				n.shape.graphics.clear().beginFill(n.normalColor).drawCircle(0, 0, nodeRadius).endFill();
			} else {
				this.stage.removeChild(n.shape);
				this.nodes.splice(i, 1);
				i -= 1;
			}
		}
	}
}

BeatChannel.prototype.addNodeAtTime = function(time) {

	let node = new BeatNode(this.shape.x + beatLineWidth * .5);
	let t = time - yOffset / pixelsPerBeat;
	node.startBeat = t;
	node.endBeat = t + 3;
	node.normalColor = BEAT_NODE_USER;
	node.triggeredColor = BEAT_NODE_USER_TRIGGERED;
	this.nodes.push(node);

	this.stage.addChild(node.shape);
}

function BeatNode(x) {
	this.shape = new createjs.Shape();
	this.startBeat = 0; 
	this.endBeat = 3;
	this.triggered = false;
	this.repeat = false;

	this.shape.x = x;
	this.shape.y = nodeRadius;
	this.shape.graphics.clear().beginFill(BEAT_NODE).drawCircle(0, 0, nodeRadius).endFill();
}
