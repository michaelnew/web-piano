// alert("this script lives in a file");

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

		var song = 'data:audio/mid;base64,TVRoZAAAAAYAAQABAMBNVHJrAAAARwD/WAQEAhgIAP9RAwehIAD/AwlOZXcgVHJhY2sAwHMAkDxkMoA8MIEOkDxkMoA8MIEOkDxkMoA8MIEOkDxkgT+APDAB/y8A';
		player = MIDI.Player;
		player.loadFile(song, player.start);
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
          // Render thumbnail.
          var span = document.createElement('span');
          var m = MidiFile(e.target.result);
          debugger;
          span.innerHTML = m["data"];
          // span.innerHTML = ['contents: ', e.target.result,
          //                   '" title: "', escape(theFile.name), '"/>'].join('');
          document.getElementById('list').insertBefore(span, null);

        };
      })(f);

      reader.readAsBinaryString(f);
      // reader.readAsText(f);
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);


// function readSingleFile(e) {
//   var file = e.target.files[0];
//   if (!file) {
//     return;
//   }
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     var contents = e.target.result;
//     displayContents(contents);
//   };
//   reader.readAsText(file);
// }

// function displayContents(contents) {
//   var element = document.getElementById('file-content');
//   element.innerHTML = contents;
//   // MidiFile(contents);
// }

// document.getElementById('file-input')
//   .addEventListener('change', readSingleFile, false);