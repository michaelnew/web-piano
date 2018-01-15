const {
		Container,
		Shape,
		Text,
		Tween
	} = require( 'easeljs' ),
	$ = require( 'jquery' ),
	{
		BEAT_NODE_USER,
		BEAT_NODE,
		beatLineWidth,
		beatNodeStrikeWidth,
		beatsPerNode,
		COLOR_6,
		NODE_STROKE_DULL,
		NODE_TRIGGERED_EARLY,
		NODE_TRIGGERED_LATE,
		NODE_TRIGGERED_PERFECT,
		nodeRadius,
		pixelsPerBeat,
		triggerBeat
	} = require( './constants' ),
	{
		beatDuration,
	} = require( './tempo.js' );

let currentTime = 0;

function BeatVisualizer(stage, triggerCallback) {
	this.stage = stage;
	this.triggerCallback = triggerCallback;
	this.channels = [];
	this.snapPoints = [];
	this.maxStreak = 0;
}

BeatVisualizer.prototype.tick = function(time) {
	let currentStreak = Number.MAX_SAFE_INTEGER;
    for (let i = 0, c; c = this.channels[i]; i++) {
		c.tick(time);
		currentStreak = Math.min(currentStreak, Math.floor(c.streakCounter / c.subdivisions));
	}
	this.maxStreak = Math.max(this.maxStreak, currentStreak);
	currentTime = time;
	publishStreakData(currentStreak, this.maxStreak);
}

function publishStreakData(currentStreak, maxStreak){

	// The "best" label should become visible once the first streak has ended
	// The reason for controlling the visibility like this is to limit the clutter in the interface on initial load
	if (currentStreak == 0 && maxStreak > 0)
	{
		$("#highestStreakValue").css("visibility", "visible");
		$("#highestStreakLabel").css("visibility", "visible");
	}

	// Then set the values
	$("#currentStreakValue").val(currentStreak);
	$("#highestStreakValue").val(maxStreak);
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
		matchingChannel.lastPlayedTimestamp = time;
		matchingChannel.triggerNearestNodeAtTime(time);
	}
}

BeatVisualizer.prototype.clearMaxStreak = function() {
	this.maxStreak = 0;
}

function BeatChannel(x, triggerPointY, note, triggerCallback, stage) {
	this.stage = stage;
	this.shape = new Shape;
	this.note = note;
	this.triggerCallback = triggerCallback;
	this.snapPoints = [];
	this.streakCounter = 0;
	this.lastPlayedTimestamp = 0;

	this.container = new Container;
	this.container.x = x;
	this.container.tickChildren = true;
	this.container.mouseEnabled = true;
	this.container.mouseChildren = true;

	this.marker = new Shape;

	let hitArea = new Shape;
	let w = nodeRadius * 2 + beatNodeStrikeWidth;
	let h = 500;
	hitArea.graphics.beginFill("#222").drawRect(- w * .5, 0, w, h);
	this.container.addChild(hitArea);

	this.moveCallback;


	this.nodes = [];

	this.shape.x = 0;
	this.shape.y = + pixelsPerBeat * triggerBeat;
	this.shape.graphics.clear().setStrokeStyle(beatNodeStrikeWidth).beginStroke(NODE_STROKE_DULL).drawCircle(0, 0, nodeRadius + beatNodeStrikeWidth).endStroke();

	this.tempoUp = new Shape;
	this.tempoDown = new Shape;
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
	this.tempoUp.alpha = .3;

	let hitArea = new Shape;
	hitArea.graphics.beginFill("#fff").drawRect(x - 10, y - 10 - dy, 20, 20);
	this.tempoUp.hitArea = hitArea;

	let t = this;
	this.tempoUp.on("pressup", function(evt) {
		t.resetToSubdivisions(t.label.text + 1);
	});

	this.tempoDown.graphics.clear().beginStroke(COLOR_6)			
		.moveTo(x - sx * .5, y - dy)
		.lineTo(x, y - sy - dy)
		.lineTo(x + sx * .5, y - dy)
	this.tempoDown.alpha = .3;

	let hitArea2 = new Shape;
	hitArea2.graphics.beginFill("#ff0").drawRect(x - 10, y - 10 + dy, 20, 20);
	this.tempoDown.hitArea = hitArea2;

	this.tempoDown.on("pressup", function(evt) {
		t.resetToSubdivisions(t.label.text - 1);
	});

	this.label = new Text("4", "100 16px Roboto", "#D2CFCE");
	this.label.x = x - 4.5; 
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
	let currentBeat = Math.trunc(currentTime) - triggerBeat;
	this.subdivisions = subdivisions;
	this.label.text = subdivisions;
	for (let b = 0; b < beatsPerNode; b++) {
		for (let i = 0; i < subdivisions; i++) {

			let node = new BeatNode();
			node.startBeat = i/subdivisions + b + currentBeat;
			node.endBeat = beatsPerNode + node.startBeat;
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

		// generate the tick sound
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

	// reset the streak counter if the relevant note wasn't played in time
	let time_per_subdivision = beatDuration()/this.subdivisions/1000.0;
	let tolerance = 1.2;
	if (time > this.lastPlayedTimestamp + time_per_subdivision * tolerance) {this.streakCounter = 0;}
}

BeatChannel.prototype.triggerNearestNodeAtTime = function(time) {
	let nearestNode;
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
		let color = null;
		if (nearestBeat > tolerance) { // too early
			color = NODE_TRIGGERED_EARLY;
			this.streakCounter = 0;
		} else if (nearestBeat < -tolerance) {
			color = NODE_TRIGGERED_LATE;
			this.streakCounter = 0;
		} else {
			color = NODE_TRIGGERED_PERFECT;
			++this.streakCounter;
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
		Tween.get(this.marker, {override: true}).wait(2000).to({alpha: 0},1000);
		
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
	this.shape = new Shape;
	this.startBeat = 0; 
	this.endBeat = beatsPerNode;
	this.triggered = false;
	this.repeat = false;

	this.shape.graphics.clear().beginFill(BEAT_NODE).drawCircle(0, 0, nodeRadius).endFill();
}

module.exports = {
	BeatVisualizer,
	BeatChannel,
	BeatNode
};
