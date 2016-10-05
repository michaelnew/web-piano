// alert("this script lives in a file");

// simple example to get started;
MIDI.loadPlugin({
	soundfontUrl: "./include/soundfont/",
    instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
    // instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
    onsuccess: function() { 
    	var delay = 0; // play one note every quarter second
			var note = 50; // the MIDI note
			var velocity = 127; // how hard the note hits
			// play the note
			MIDI.setVolume(0, 127);
			MIDI.noteOn(0, note, velocity, delay);
			MIDI.noteOff(0, note, delay + 0.75);
	}
});