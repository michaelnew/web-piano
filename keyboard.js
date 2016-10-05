var midi, data;

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({
        sysex: false // this defaults to 'false' and we won't be covering sysex in this article. 
    }).then(onMIDISuccess, onMIDIFailure);
} else {
    alert("No MIDI support in your browser.");
}

// midi functions
function onMIDISuccess(midiAccess) {
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
        listInputs(input);
    }

    console.log('MIDI Access Object', midiAccess);
}

function listInputs(inputs){
	var input = inputs.value;
		console.log("Input port : [ type:'" + input.type + "' id: '" + input.id + 
				"' manufacturer: '" + input.manufacturer + "' name: '" + input.name + 
				"' version: '" + input.version + "']");
}

function onMIDIFailure(e) {
    // when we get a failed response, run this code
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}

function onMIDIMessage(message) {
        
    data = event.data,
	cmd = data[0] >> 4,
	channel = data[0] & 0xf,
	type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
	note = data[1],
	velocity = data[2];
	// with pressure and tilt off
	// note off: 128, cmd: 8 
	// note on: 144, cmd: 9
	// pressure / tilt on
	// pressure: 176, cmd 11: 
	// bend: 224, cmd: 14
	// log('MIDI data', data);
	switch(type){
		case 144: // noteOn message 
			MIDI.noteOn(0, note, velocity, 0);
			// noteOn(note, velocity);
			break;
		case 128: // noteOff message 
			MIDI.noteOff(0, note, 0);
			// noteOff(note, velocity);
			break;
	}
	
	console.log('data', data, 'cmd', cmd, 'channel', channel);
	// logger(keyData, 'key data', data); 
}