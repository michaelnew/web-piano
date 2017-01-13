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
		// player.BPM = 300;
		// player.loadFile(song, player.start);

		MIDIPlayerPercentage(player);
	}
});

var MIDIPlayerPercentage = function(player) {
	// update the timestamp
	var time1 = document.getElementById("time");

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

		// // makes the player repeat
		// if (now === end) { // go to next song
		// 	player.currentTime = 0;
		// 	player.resume();
		// }
		time1.innerHTML = timeFormatting(now);
	});
};

function bumpTempo(evt) {
	if (player != null) {
		console.log("increasing tempo");
		// player.BPM = 500;
		// player.replayer.bpmOverride = true;
		// player.replayer.beatsPerMinute = 500;
		// player.timeWarp = 2;
		player.setTempoMultiplier(.5);
		// MIDI.setTempoMultiplier(.5);
		// player.pause();
		// player.resume();
	}
	// player.debug();
}

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
        	// player.tempoMultiplier = 2.0;
			player.loadFile(e.target.result, player.start);

          // To use jasmid, load the file as a binary string (reader.readAsBinaryString(f))
          // var m = MidiFile(e.target.result);
        };
      })(f);

      // reader.readAsBinaryString(f); // use for jasmid
      reader.readAsDataURL(f);
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
	console.log("fired handlefileSelect");
}

document.getElementById("forwardButton").onclick = bumpTempo;
// document.getElementById('forwardButton').addEventListener('onclick', bumpTempo, false);
document.getElementById('files').addEventListener('change', handleFileSelect, false);




if (!Array.prototype.remove) {
  	Array.prototype.remove = function(val) {
		var i = this.indexOf(val);
		return i>-1 ? this.splice(i, 1) : [];
	};
}

var triggeredKeyCodes = [];

document.onkeydown = function (e) {
	e = e || window.event;
	
	var alreadyTriggered = false;
    for (var i = 0, kc; kc = triggeredKeyCodes[i]; i++) {
		//console.log(kc);
		if (kc == e.keyCode) {
			//console.log("key already triggered");
			alreadyTriggered = true;
		}
	}

	if (!alreadyTriggered) {
		MIDI.noteOn(0, e.keyCode, 127, 0);
		triggeredKeyCodes.push(e.keyCode);

		//console.log("key pressed " + e.keyCode);
	}
};

document.onkeyup = function (e) {
	e = e || window.event;
	//console.log("keyup fired " + e.keyCode);
	MIDI.noteOff(0, e.keyCode, 0);

	var temp = triggeredKeyCodes.slice();
	triggeredKeyCodes = [];
    for (var i = 0, kc; kc = temp[i]; i++) {
		if (e.keyCode != kc) {
			triggeredKeyCodes.push(kc);
		}
	}
	console.log(triggeredKeyCodes);
};
