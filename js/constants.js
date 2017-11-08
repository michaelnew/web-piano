const COLOR_1 = "#FAE747",
	COLOR_2 = "#6bff8b",  // green
	COLOR_3 = "#4ad3e4", 	// blue
	COLOR_3b = "#1f86aa", // slightly darker blue
	COLOR_4 = "#ea4634", 	// red
	COLOR_4b = "#ba322e", // slightly darker red
	COLOR_5 = "#6B456F",
	COLOR_6 = "#FFFFFF", 	// white
	COLOR_7 = "#355e70"; 	// darkish blue

module.exports = {
	BEAT_LINE: COLOR_2,
	BEAT_NODE_TRIGGERED: COLOR_3,
	BEAT_NODE_USER_TRIGGERED: COLOR_4,
	BEAT_NODE_USER: COLOR_4,
	BEAT_NODE: COLOR_7,
	beatLineHeight: 5,
	beatLineWidth: 30,
	beatNodeStrikeWidth: 2,
	beatsPerNode: 2,
	blackKeyCornerRadius: 6,
	blackKeyHeight: 80*1.1,
	blackKeyWidth: 18*1.1,
	blackNotes: [22,25,27,30,32,34,37,39,42,44,46,49,51,54,56,58,61,63,66,68,70,73,75,78,80,82,85,87,90,92,94,97,99,102,104,106],
	COLOR_1,
	COLOR_2,
	COLOR_3,
	COLOR_3b,
	COLOR_4,
	COLOR_4b,
	COLOR_5,
	COLOR_6,
	COLOR_7,
	keyCornerRadius: 9,
	keyGap: 3,
	keyHeight: 130,
	keyWidth: 30,
	NODE_STROKE_DULL: COLOR_7,
	NODE_STROKE: COLOR_2,
	NODE_TRIGGERED_EARLY: COLOR_3b,
	NODE_TRIGGERED_LATE: COLOR_4b,
	NODE_TRIGGERED_PERFECT: COLOR_2,
	nodeRadius: 12,
	pixelsPerBeat: 300,
	triggerBeat: 1.2,
	TRIGGERED_KEY_BLACK: COLOR_2,
	TRIGGERED_KEY_WHITE: COLOR_2,
	xOffset: 0,
	yOffset: 500,
};
