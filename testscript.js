var player;

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
		// player.loadFile(song, player.start);
	}
});

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');

      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
			player.loadFile(e.target.result, player.start);

          // To use jasmid, load the file as a binary string (reader.readAsBinaryString(f))
          // var m = MidiFile(e.target.result);
        };
      })(f);

      // reader.readAsBinaryString(f); // use for jasmid
      reader.readAsDataURL(f);
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);