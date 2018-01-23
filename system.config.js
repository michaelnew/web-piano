/* globals SystemJS */
SystemJS.config( {
	map: {
		'midi-plugin-audiotag': 'lib/midi/js/midi/plugin.audiotag.js',
		'midi-plugin-webaudio': 'lib/midi/js/midi/plugin.webaudio.js',
		'midi-plugin-webmidi': 'lib/midi/js/midi/plugin.webmidi.js',
		easeljs: 'https://code.createjs.com/easeljs-0.8.2.min.js',
		jquery: 'lib/jquery/dist/jquery.min.js',
		midi: 'lib/midi/build/MIDI.min.js',
		soundfont: 'include/soundfont',
		tweenjs: 'https://code.createjs.com/tweenjs-0.6.2.min.js',
		app: 'js'
	},
	packages: {
		'midi-plugin': {
			defaultExtension: 'js'
		},
		app: {
			main: 'app.js',
			defaultExtension: 'js'
		}

	},
	meta: {
		midi: {
			format: 'global',
			exports: 'MIDI',
			deps: [
				'lib/midi/inc/shim/Base64.js',
				'lib/midi/inc/shim/Base64binary.js',
				'lib/midi/inc/shim/WebAudioAPI.js',
				'lib/midi/inc/shim/WebMIDIAPI.js',
				'lib/midi/inc/tuna/tuna.js',
				'lib/midi/inc/jasmid/midifile.js',
				'lib/midi/inc/jasmid/replayer.js',
				'lib/midi/inc/jasmid/stream.js'
			]
		},
		'midi-plugin-audiotag': {
			format: 'global',
			deps: [ 'midi' ]
		},
		'midi-plugin-webaudio': {
			format: 'global',
			deps: [ 'midi' ]
		},
		'midi-plugin-webmidi': {
			format: 'global',
			deps: [ 'midi' ]
		},
		tweenjs: {
			format: 'global',
			exports: 'createjs'
		},
		easeljs: {
			format: 'global',
			exports: 'createjs'
		}
	}
} );
