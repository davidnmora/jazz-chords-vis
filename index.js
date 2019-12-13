

const VIS_CONTAINER = '#vis-container'
Object.keys(CHORD_PROGRESSIONS).forEach(chordProgressionName => {
	const chordViz = new ChordViz(CHORD_PROGRESSIONS[chordProgressionName], VIS_CONTAINER)
})

