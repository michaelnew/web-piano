// TODO: globals are gross
var keyCodeMap;
var player;
var piano;
var beatVisualizer;
var stage;

let percentAccumulator = 0;
var currentBeat = 0;
var currentNumericBeat = 0;
var lastBeat = 0;

let tempo = 60;

$( document ).ready(function() {
	$.getJSON( "data/test.json", function( data ) {
		keyCodeMap = data["keymap"];
	});
});

// simple example to get started;
MIDI.loadPlugin({
	soundfontUrl: "./include/soundfont/",
    //instrument: "banjo", // or the instrument code 1 (aka the default)
	//instrument: "banjo",
    instruments: [ "acoustic_grand_piano", "banjo" ], // or multiple instruments
    onsuccess: function() { 
  		// var delay = 0; // play one note every quarter second
		// var note = 50; // the MIDI note
		// var velocity = 127; // how hard the note hits
		MIDI.setVolume(0, 127);
		// MIDI.noteOn(0, note, velocity, delay);
		// MIDI.noteOff(0, note, delay + 0.75);
		player = MIDI.Player;
		// player.BPM = 300;
		// player.loadFile(song, player.start);

		//MIDIPlayerPercentage(player);
		MIDI.programChange(0, MIDI.GM.byName['acoustic_grand_piano'].number);
		MIDI.programChange(1, MIDI.GM.byName['banjo'].number);
	}
});

function beatDuration() {
	return 1000 * 60 / tempo;
}

function tempoUp() {
	tempo += 1;
	document.getElementById("tempo").innerHTML = tempo;
}

function tempoDown() {
	tempo -= 1;
	document.getElementById("tempo").innerHTML = tempo;
}

function keyCodeToNote(kc) {
	var translated = keyCodeMap[kc];
	if (translated == null) {
		translated = kc;
	}
	return translated;
}


var triggeredKeyCodes = [];
var keyCodeRecorder = [];

document.onkeydown = function (e) {
	e = e || window.event;
	
	var note = keyCodeToNote(e.keyCode);
	var alreadyTriggered = false;

    for (var i = 0, kc; kc = triggeredKeyCodes[i]; i++) {
		if (kc == note) {
			alreadyTriggered = true;
		}
	}

	if (!alreadyTriggered) {
		MIDI.noteOn(0, note, 127, 0);
		triggeredKeyCodes.push(note);

		piano.toggleKey(note, true);
		//beatVisualizer.addNodeToChannel(note, currentBeat);
		beatVisualizer.triggerNearestNodeOnChannel(note, currentNumericBeat + percentAccumulator);

		//keyCodeRecorder.push(e.keyCode);
		//console.log(keyCodeRecorder);
	}
};

document.onkeyup = function (e) {
	e = e || window.event;
	//console.log("keyup fired " + e.keyCode);
	var note = keyCodeToNote(e.keyCode);
	MIDI.noteOff(0, note, 0);

	piano.toggleKey(note, false);

	var temp = triggeredKeyCodes.slice();
	triggeredKeyCodes = [];
    for (var i = 0, kc; kc = temp[i]; i++) {
		if (note != kc) {
			triggeredKeyCodes.push(kc);
		}
	}
};


// Easel.JS
function init() {
	stage = new createjs.Stage("demoCanvas");
	//stage.enableMouseOver(3); // this is expensive, so it may be better to not use it 

	//createjs.Ticker.timingMode = createjs.Ticker.RAF; // syncs to display, does not respect framerate value
	//createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED; // synce to display but tries to use framerate
	createjs.Ticker.timingMode = createjs.Ticker.TIMEOUT; // does not sync to display, just uses a simple timer
	createjs.Ticker.framerate = 60;
	createjs.Ticker.addEventListener("tick", tick);

	if (window.devicePixelRatio) {
		// grab the width and height from canvas
		var height = stage.canvas.getAttribute('height');
		var width = stage.canvas.getAttribute('width');
		// reset the canvas width and height with window.devicePixelRatio applied
		stage.canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));
		stage.canvas.setAttribute('height', Math.round( height * window.devicePixelRatio));
		// force the canvas back to the original size using css
		stage.canvas.style.width = width+"px";
		stage.canvas.style.height = height+"px";
		// set CreateJS to render scaled
		stage.scaleX = stage.scaleY = window.devicePixelRatio;
	}

 	piano = new PianoVisualizer(stage, function(note, on) {
		if (on) {
			MIDI.noteOn(0, note, 50, 0);
		} else {
			MIDI.noteOff(0, note, 0);
		}
	});

	beatVisualizer = new BeatVisualizer(stage, function(note) {
		MIDI.noteOn(1, note, 50, 0);
		MIDI.noteOff(1, note, .1);
	});

	let note1 = 69;
	let note2 = 76;

	beatVisualizer.setChannelSnapPoints(piano.topCenterForAllKeys());

	let channel1 = beatVisualizer.addChannel(piano.topCenterForKey(note1), yOffset, note1);
	channel1.addSubdividedNodes(2);
	channel1.moveCallback = function(note) {
		console.log("moved channel to new note");
	}

	let channel2 = beatVisualizer.addChannel(piano.topCenterForKey(note2), yOffset, note2);
	channel2.addSubdividedNodes(3);
}


function tick(event) {

	let d = beatDuration();

	currentBeat = event.time;

	let dt = currentBeat - lastBeat;

	let percent = dt / d;

	percentAccumulator += percent;

	if (percentAccumulator > 1) {
		percentAccumulator -= 1;
		currentNumericBeat += 1;
	}

	beatVisualizer.tick(currentNumericBeat + percentAccumulator);
	
	stage.update(event);

	lastBeat = currentBeat;
}

