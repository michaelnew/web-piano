
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
	this.stage.addChild(channel.marker);
	

	return channel;
}

BeatVisualizer.prototype.setChannelSnapPoints = function(snapPoints) {
	this.snapPoints = snapPoints;
    for (let c in this.channels) {
		c.snapPoints = this.snapPoints;
	}
}

BeatVisualizer.prototype.channelForNote = function(note) {
	let matchingChannel;
    for (let i = 0, c; c = this.channels[i]; i++) {
		if (c.note == note) {
			matchingChannel = c;
		}
	}
	return matchingChannel;
}

BeatVisualizer.prototype.addNodeToChannel = function(note, time) {

	let matchingChannel = this.cannelForNote(note);

	if (matchingChannel) {
		matchingChannel.addNodeAtTime(time);
	}
}

BeatVisualizer.prototype.triggerNearestNodeOnChannel = function(note, time) {

	let matchingChannel = this.channelForNote(note);

	if (matchingChannel) {
		matchingChannel.triggerNearestNodeAtTime(time);
	}
}



function BeatChannel(x, triggerPointY, note, triggerCallback, stage) {
	this.stage = stage;
	this.shape = new createjs.Shape();
	this.note = note;
	this.triggerCallback = triggerCallback;
	this.snapPoints = [];
	this.marker = new createjs.Shape();

	let hitArea = new createjs.Shape();
	let w = nodeRadius * 2 + beatNodeStrikeWidth;
	let h = 500;
	hitArea.graphics.beginFill("#000").drawRect(- w * .5, - h * .5, w, h);
	this.shape.hitArea = hitArea;

	this.moveCallback;

	//x = x - beatLineWidth * .5;

	this.nodes = [];

	this.shape.x = x;
	this.shape.y = + pixelsPerBeat * triggerBeat;
	//this.shape.graphics.clear().beginFill(BEAT_LINE).drawRect(0, 0, beatLineWidth, beatLineHeight).endFill();
	//this.shape.graphics.clear().beginFill(BEAT_LINE).drawCircle(0, 0, nodeRadius).endFill();
	this.shape.graphics.clear().setStrokeStyle(beatNodeStrikeWidth).beginStroke(NODE_STROKE).drawCircle(0, 0, nodeRadius + beatNodeStrikeWidth).endStroke();

	let c = this;
	this.shape.on("pressmove", function(evt) {
		evt.target.x = evt.stageX / stage.scaleX;
	});

	this.shape.on("pressup", function(evt) {
		c.snapToNearestPoint();
	});
}

BeatChannel.prototype.snapToNearestPoint = function() {
	let nearestDistance  = 10000000;
	let nearestKey;

	let x = this.shape.x;

    for (let i = 0, ki; ki = this.snapPoints[i]; i++) {
		let diff = x - ki.topCenterX;
		diff = Math.abs(diff);
		if (diff < nearestDistance) {
			nearestDistance = diff;
			nearestKey = ki;
		}
	}

	console.log(nearestKey);
	this.moveCallback();
	this.note = nearestKey.note;
	this.shape.x = nearestKey.topCenterX;
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
			//node.triggeredColor = BEAT_NODE_TRIGGERED;

			this.nodes.push(node);
			this.stage.addChild(node.shape);
		}
	}
}

BeatChannel.prototype.tick = function(time) {
    for (let i = 0, n; n = this.nodes[i]; i++) {
		//n.tick(time);

		// y = (time - sb) * ppb
		// y/ppb = time - sb
		// y/ppb + sb = time
		// time = y/ppb + sb
		n.shape.y = (time - n.startBeat) * pixelsPerBeat;
		n.shape.x = this.shape.x;

		if (n.shape.y / pixelsPerBeat > triggerBeat  && !n.triggered) {
			n.triggered = true;
			this.triggerCallback(this.note);
		//	n.shape.graphics.clear().beginFill(n.triggeredColor).drawCircle(0, 0, nodeRadius).endFill();
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
	this.marker.x = this.shape.x;
}

BeatChannel.prototype.triggerNearestNodeAtTime = function(time) {

	let nearestBeat =  100000;

    for (let i = 0, n; n = this.nodes[i]; i++) {

		let b = time - n.startBeat;
		let d = triggerBeat - b;
		if (Math.abs(d) < Math.abs(nearestBeat)) {
			nearestBeat = d;
			nearestNode = n;
		}
	}

	if (nearestNode) {
		this.marker.graphics.clear().beginFill(COLOR_6).drawCircle(0, nearestNode.shape.y, nodeRadius).endFill();
		this.marker.alpha = .4;
		createjs.Tween.get(this.marker, {override: true}).wait(2000).to({alpha: 0},1000);

		//console.log("distance to node: " + nearestBeat);
		// positive is too early, negative is too late
		let tolerance = .015;
		let color = NODE_TRIGGERED_PERFECT;
		if (nearestBeat > tolerance) { // to early
			color = NODE_TRIGGERED_EARLY;
		} else if (nearestBeat < -tolerance) {
			color = NODE_TRIGGERED_LATE;
		}
		
		nearestNode.shape.graphics.clear().beginFill(color).drawCircle(0, 0, nodeRadius).endFill();
	}
}

BeatChannel.prototype.addNodeAtTime = function(time) {

	let node = new BeatNode(this.shape.x);
	node.startBeat = time - triggerBeat;
	node.endBeat = time + triggerBeat;
	node.normalColor = BEAT_NODE_USER;
	//node.triggeredColor = BEAT_NODE_USER_TRIGGERED;
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
