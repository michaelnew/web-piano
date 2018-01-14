
// public API:

// call with no arguments to the current tempo.
// call with 1 argument to set the tempo.
function tempo(){
	if (arguments.length == 1)
	{
		setTempo(arguments[0])
	}
	else
	{
		return getTempo();
	}
}

function beatDuration() {
	return 1000 * 60 / getTempo();
}


// implementation details:

let tempo_ = 60;

function getTempo(){
	return tempo_;
}

function setTempo(newTempo){
	tempo_ = parseInt(boundedTempo(newTempo));
}


function boundedTempo(t) {
	let r = t;
	if (t < .1) {
		r = .1;
	} else if (t > 1000) {
		r = 1000;
	}
	return r;
}