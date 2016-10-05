// alert("this script lives in a file");

var player;

// simple example to get started;
MIDI.loadPlugin({
	soundfontUrl: "./include/soundfont/",
    instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
    // instruments: [ "acoustic_grand_piano", "acoustic_guitar_nylon" ], // or multiple instruments
    onsuccess: function() { 
  //   	var delay = 0; // play one note every quarter second
		// var note = 50; // the MIDI note
		// var velocity = 127; // how hard the note hits
			// // play the note
		MIDI.setVolume(0, 127);
		// MIDI.noteOn(0, note, velocity, delay);
		// MIDI.noteOff(0, note, delay + 0.75);

		var song = 'data:audio/mid;base64,TVRoZAAAAAYAAQABAMBNVHJrAAAARwD/WAQEAhgIAP9RAwehIAD/AwlOZXcgVHJhY2sAwHMAkDxkMoA8MIEOkDxkMoA8MIEOkDxkMoA8MIEOkDxkgT+APDAB/y8A';

		// var title = document.getElementById("title");
		// title.innerHTML = "Sound being generated with " + MIDI.api + " " + JSON.stringify(MIDI.supports);

		/// this sets up the MIDI.Player and gets things going...
		// player.timeWarp = 1; // speed the song is played back
		player = MIDI.Player;
		player.loadFile(song, player.start);

		/// control the piano keys colors
		// var colorMap = MIDI.Synesthesia.map();
		// player.addListener(function(data) {
		// 	var pianoKey = data.note - 21;
		// 	var d = colorElements[pianoKey];
		// 	if (d) {
		// 		if (data.message === 144) {
		// 			var map = colorMap[data.note - 27];
		// 			if (map) d.style.background = map.hex;
		// 			d.style.color = "#fff";
		// 		} else {
		// 			d.style.background = "";
		// 			d.style.color = "";
		// 		}
		// 	}
		// });
		///
		// ColorSphereBackground();
		// MIDIPlayerPercentage(player);
	}
});


function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    displayContents(contents);
  };
  reader.readAsText(file);
}

function displayContents(contents) {
  var element = document.getElementById('file-content');
  element.innerHTML = contents;
}

document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);