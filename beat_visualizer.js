
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
	this.stage.addChild(channel.container);
	
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

	this.container = new createjs.Container();
	this.container.x = x;
	this.container.tickChildren = true;
	this.container.mouseEnabled = true;
	this.container.mouseChildren = true;

	this.marker = new createjs.Shape();

	let hitArea = new createjs.Shape();
	let w = nodeRadius * 2 + beatNodeStrikeWidth;
	let h = 500;
	hitArea.graphics.beginFill("#222").drawRect(- w * .5, 0, w, h);
	//hitArea.alpha = .01;
	//this.container.hitArea = hitArea;
	this.container.addChild(hitArea);

	this.moveCallback;


	this.nodes = [];

	this.shape.x = 0;
	this.shape.y = + pixelsPerBeat * triggerBeat;
	this.shape.graphics.clear().setStrokeStyle(beatNodeStrikeWidth).beginStroke(NODE_STROKE_DULL).drawCircle(0, 0, nodeRadius + beatNodeStrikeWidth).endStroke();

	this.tempoUp = new createjs.Shape();
	this.tempoDown = new createjs.Shape();
	this.createTempoButtons(this.shape.y);

	let c = this;
	this.container.on("pressmove", function(evt) {
		if (evt.target == hitArea) {
			c.container.x = evt.stageX / stage.scaleX;
		}
	});

	this.container.on("pressup", function(evt) {
		if (evt.target == hitArea) {
			c.snapToNearestPoint();
		}
	});

	this.container.addChild(this.marker);
	this.container.addChild(this.shape);
	this.container.addChild(this.label);
	this.container.addChild(this.tempoUp);
	this.container.addChild(this.tempoDown);
}

BeatChannel.prototype.createTempoButtons = function(y) {

	let x = nodeRadius * 2 + beatNodeStrikeWidth;
	let sx = 8;
	let sy = 4;
	let dy = 14;

	this.tempoUp.graphics.clear().beginStroke(COLOR_6)			
		.moveTo(x - sx * .5, y + dy)
		.lineTo(x, y + sy + dy)
		.lineTo(x + sx * .5, y + dy)

	let hitArea = new createjs.Shape();
	hitArea.graphics.beginFill("#fff").drawRect(x - 10, y - 10 - dy, 20, 20);
	this.tempoUp.hitArea = hitArea;
	//this.container.addChild(hitArea);

	let t = this;
	this.tempoUp.on("pressup", function(evt) {
		t.resetToSubdivisions(t.label.text + 1);
	});

	this.tempoDown.graphics.clear().beginStroke(COLOR_6)			
		.moveTo(x - sx * .5, y - dy)
		.lineTo(x, y - sy - dy)
		.lineTo(x + sx * .5, y - dy)

	let hitArea2 = new createjs.Shape();
	hitArea2.graphics.beginFill("#ff0").drawRect(x - 10, y - 10 + dy, 20, 20);
	this.tempoDown.hitArea = hitArea2;
	//this.container.addChild(hitArea2);

	this.tempoDown.on("pressup", function(evt) {
		t.resetToSubdivisions(t.label.text - 1);
	});

	this.label = new createjs.Text("4", "100 16px Roboto", "#D2CFCE");
	this.label.x = x - 4; 
	this.label.y = y;
	this.label.textBaseline = "middle";
}

BeatChannel.prototype.snapToNearestPoint = function() {
	let nearestDistance = 10000000;
	let nearestKey;

	let x = this.container.x;

    for (let i = 0, ki; ki = this.snapPoints[i]; i++) {
		let diff = x - ki.topCenterX;
		diff = Math.abs(diff);
		if (diff < nearestDistance) {
			nearestDistance = diff;
			nearestKey = ki;
		}
	}

	console.log(nearestKey);
	if (this.moveCallback) { this.moveCallback(); }
	this.note = nearestKey.note;
	this.container.x = nearestKey.topCenterX;
}

BeatChannel.prototype.getCenterX = function() {
	return this.container.x + beatLineWidth * .5;
}

BeatChannel.prototype.addSubdividedNodes = function(subdivisions) {
	this.label.text = subdivisions;
	for (let b = 0; b < beatsPerNode; b++) {
		for (let i = 0; i < subdivisions; i++) {

			let node = new BeatNode();
			node.startBeat = i/subdivisions + b;
			node.endBeat = 3 + i/subdivisions + b;
			node.repeat = true;
			node.normalColor = BEAT_NODE;
			node.shape.alpha = .3;
			//node.triggeredColor = BEAT_NODE_TRIGGERED;

			this.nodes.push(node);
			this.container.addChild(node.shape);
		}
	}
}

BeatChannel.prototype.resetToSubdivisions = function(subdivisions) {

    for (let i = 0, n; n = this.nodes[i]; i++) {
		this.container.removeChild(n.shape);
	}

	this.nodes = [];

	this.addSubdividedNodes(subdivisions);
}

BeatChannel.prototype.tick = function(time) {
    for (let i = 0, n; n = this.nodes[i]; i++) {
		//n.tick(time);

		// y = (time - sb) * ppb
		// y/ppb = time - sb
		// y/ppb + sb = time
		// time = y/ppb + sb
		n.shape.y = (time - n.startBeat) * pixelsPerBeat;
		//n.shape.x = this.shape.x;

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
				n.shape.alpha = .3;
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
		//this.marker.graphics.clear().beginFill(COLOR_6).drawCircle(0, nearestNode.shape.y, nodeRadius).endFill();
		//this.marker.graphics.clear().setStrokeStyle(beatNodeStrikeWidth).beginStroke(COLOR_6).drawCircle(0, nearestNode.shape.y, 16).endStroke();
		//this.marker.graphics.clear().beginFill(COLOR_6).drawRect(-nodeRadius - beatNodeStrikeWidth - 12, nearestNode.shape.y, 10, 2).endFill();

		//console.log("distance to node: " + nearestBeat);
		// positive is too early, negative is too late
		let tolerance = .02;
		let color = NODE_TRIGGERED_PERFECT;
		if (nearestBeat > tolerance) { // to early
			color = NODE_TRIGGERED_EARLY;
		} else if (nearestBeat < -tolerance) {
			color = NODE_TRIGGERED_LATE;
		}

		let x = -nodeRadius - beatNodeStrikeWidth - 8;
		let y = nearestNode.shape.y;
		let sx = 2;
		let sy = nodeRadius * 2 + beatNodeStrikeWidth - 2;
		this.marker.graphics.clear().beginFill(color)
			.drawRect(x, y - sy*.5, sx, sy);

		//this.marker.graphics.clear().beginFill(color)
		//	.moveTo(x - sx - 2, y - sy*.5)
		//	.lineTo(x - sx, y - sy*.5)
		//	.lineTo(x, y)
		//	.lineTo(x-sx, y+sy*.5)
		//	.lineTo(x-sx - 2, y+sy*.5)
		//	.lineTo(x - sx - 2, y-sy*.5);
		
		this.marker.alpha = 1.0;
		createjs.Tween.get(this.marker, {override: true}).wait(2000).to({alpha: 0},1000);
		
		this.shape.graphics.clear().setStrokeStyle(beatNodeStrikeWidth).beginStroke(color).drawCircle(0, 0, nodeRadius + beatNodeStrikeWidth).endStroke();
		nearestNode.shape.graphics.clear().beginFill(color).drawCircle(0, 0, nodeRadius).endFill();
		nearestNode.shape.alpha = 1;
	}
}

BeatChannel.prototype.addNodeAtTime = function(time) {

	let node = new BeatNode();
	node.startBeat = time - triggerBeat;
	node.endBeat = time + triggerBeat;
	node.normalColor = BEAT_NODE_USER;
	//node.triggeredColor = BEAT_NODE_USER_TRIGGERED;
	this.nodes.push(node);

	this.stage.addChild(node.shape);
}

function BeatNode() {
	this.shape = new createjs.Shape();
	this.startBeat = 0; 
	this.endBeat = 3;
	this.triggered = false;
	this.repeat = false;

	this.shape.graphics.clear().beginFill(BEAT_NODE).drawCircle(0, 0, nodeRadius).endFill();
}
