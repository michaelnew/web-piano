var keyCodeMap;
var player;
var piano;

$( document ).ready(function() {
	 
	$.getJSON( "data/test.json", function( data ) {
		keyCodeMap = data["keymap"];
	});
});

// simple example to get started;
MIDI.loadPlugin({
	soundfontUrl: "./include/soundfont/",
    instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
    // instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
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
	}
});


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

		console.log("key pressed " + e.keyCode + " translated to " + note);

		piano.toggleKey(note, true);

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
	var stage = new createjs.Stage("demoCanvas");
	piano = new PianoVisualizer(stage);
}
