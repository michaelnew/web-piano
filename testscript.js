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

		MIDIPlayerPercentage(player);
	}
});

var MIDIPlayerPercentage = function(player) {
		// update the timestamp
		var time1 = document.getElementById("time");
		// var time2 = document.getElementById("time2");
		// var capsule = document.getElementById("capsule");
		// var timeCursor = document.getElementById("cursor");
		//
		// eventjs.add(capsule, "drag", function(event, self) {
		// 	eventjs.cancel(event);
		// 	player.currentTime = (self.x) / 420 * player.endTime;
		// 	if (player.currentTime < 0) player.currentTime = 0;
		// 	if (player.currentTime > player.endTime) player.currentTime = player.endTime;
		// 	if (self.state === "down") {
		// 		player.pause(true);
		// 	} else if (self.state === "up") {
		// 		player.resume();
		// 	}
		// });
		//
		function timeFormatting(n) {
			var minutes = n / 60 >> 0;
			var seconds = String(n - (minutes * 60) >> 0);
			if (seconds.length == 1) seconds = "0" + seconds;
			return minutes + ":" + seconds;
		};

		player.setAnimation(function(data, element) {
			var percent = data.now / data.end;
			var now = data.now >> 0; // where we are now
			var end = data.end >> 0; // end of song

			// makes the player repeat
			if (now === end) { // go to next song
				player.currentTime = 0;
				player.resume();
			}
			// display the information to the user
			// timeCursor.style.width = (percent * 100) + "%";
			time1.innerHTML = timeFormatting(now);
			// time2.innerHTML = "-" + timeFormatting(end - now);
		});
	};

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