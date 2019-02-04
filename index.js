// Constants
const circleNotesDataByNote = {
	'C': {note: 'C', fifthsIndex: 0, chromaticIndex: 0,},
	'G': {note: 'G', fifthsIndex: 1, chromaticIndex: 7,},
	'D': {note: 'D', fifthsIndex: 2, chromaticIndex: 2,},
	'A': {note: 'A', fifthsIndex: 3, chromaticIndex: 9,},
	'E': {note: 'E', fifthsIndex: 4, chromaticIndex: 4,},
	'B': {note: 'B', fifthsIndex: 5, chromaticIndex: 11,},
	'Fsharp': {note: 'Fsharp', fifthsIndex: 6, chromaticIndex: 6,},
	'Csharp': {note: 'Csharp', fifthsIndex: 7, chromaticIndex: 1,},
	'Gsharp': {note: 'Gsharp', fifthsIndex: 8, chromaticIndex: 8,},
	'Eflat': {note: 'Eflat', fifthsIndex: 9, chromaticIndex: 3,},
	'Bflat': {note: 'Bflat', fifthsIndex: 10, chromaticIndex: 10,},
	'F': {note: 'F', fifthsIndex: 11, chromaticIndex: 5,},
};
const circleNotesData = Object.values(circleNotesDataByNote)
const colorScale = d3.scaleLinear().domain([0, circleNotesData.length]).range(['blue', 'red'])
const height = 500, width = 500
const svg = d3.select('#canvas').append('svg').attr('width', 900).attr('height', 900)
// Globals
let indexType = 'fifthsIndex'
let noteGroup, songPath;
const CHORD_ARRAY = ['A', 'D', 'G', 'C', 'Fsharp', 'B', 'E']


// Helper functions:
function chordsToCoords(chords) {
	return chords.map(chord => getCoordsFromIndex(circleNotesDataByNote[chord][indexType]))
}


// Coord Calculations
function getCoordsFromIndex(index) {
	const increment = 2 * Math.PI / circleNotesData.length
	const angle = increment * index
	const radius = 200
	const [x, y] = d3.pointRadial(angle, radius)
	return [x + width/2, y + height/2]
}

function updateCircleNotesData(circleNotesData) {
	circleNotesData.forEach(d => {
		const [x, y] = getCoordsFromIndex(d[indexType])
		d.x = x
		d.y = y
		d.color = colorScale(d['chromaticIndex']) // Keep color constant regardless of fifths or chromatic
	})
	console.log('DONE UPDATING:', circleNotesData)
}


// Main function
function updateVis() {
	indexType = indexType === 'chromaticIndex' ? 'fifthsIndex' : 'chromaticIndex'
	d3.select('#circle-type').html(indexType)
	
	updateCircleNotesData(circleNotesData, indexType)
	// Create high-level vis features if needed
	if (!noteGroup) {
		noteGroup = svg.selectAll('.note-group')
			.data(circleNotesData).enter()
			.append("g")
			.classed('note-group', true)
			.attr("transform", d => `translate(${d.x},${d.y})`)
		
		const noteCircle = noteGroup
			.append("circle")
			.attr("r", 20)
			.attr("fill", d => d.color)
			.on('mouseover', d => console.log(d));
		
		const noteLabel = noteGroup
			.append("text")
			.text(d => d.note)
	}
	
	if (!songPath) {
		songPath = svg.append('path')
			.attr('fill', 'none')
			.attr('stroke', 'blue')
			.attr('stroke-width', 3)
		const coords = chordsToCoords(CHORD_ARRAY)
		const pathData = d3.line()(coords)
		svg.select('path')
			.attr('d', pathData)
	}
	
	// Transition to updated state
	noteGroup.transition().duration(1000)
		.delay((d, i) => i * 50)
		.attr("transform", d => `translate(${d.x},${d.y})`)
	
	
}

updateVis()