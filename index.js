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
const colors = {
	text: '#bdc3c7',
	line: '#2ecc71',
	canvas: '#2c3e50',
}

const CIRCLE_OF_FOURTHS_TRANSITION_DURATION = 1000
const PATH_DRAWING_ANIMATION_DURATION = 3000

const circleNotesData = Object.values(circleNotesDataByNote)
const colorScale = d3.scaleLinear().domain([0, circleNotesData.length]).range(['blue', 'red'])
const height = 500, width = 500


class ChordViz extends Object {
	constructor(CHORD_ARRAY, visContainer) {
		super()
		console.log('CONSTRUCTOR')
		this.CHORD_ARRAY = CHORD_ARRAY
		this.svg = d3.select(visContainer).append('svg').attr('width', 900).attr('height', 900).style('background-color', colors.canvas)
		this.indexType = 'fifthsIndex'
		d3.select('#circle-type').html(this.indexType).on('click', () => {
			this.toggleCircle()
		})
		
		this.updateCircleNotesData()
		
		
		this.noteGroup = this.svg.selectAll('.note-group')
			.data(circleNotesData).enter()
			.append("g")
			.classed('note-group', true)
			.attr("transform", d => `translate(${d.x},${d.y})`)
		
		const noteCircle = this.noteGroup
			.append("circle")
			.attr("r", d => d.note === 'E' ? 20 : 0)
			.attr("fill", d => d.color)
		
		const noteLabel = this.noteGroup
			.append("text")
			.attr('font-size', 46)
			.attr('fill', colors.text)
			.text(d => d.note.replace('sharp', '#').replace('flat', 'b'))
		
		
		this.songPath = this.svg.append('path')
			.classed('song-path', true)
			.attr('fill', 'none')
			.attr('stroke', colors.line)
			.attr('stroke-width', 2)
			.attr('stroke-opacity', 0.2)
			.style('stroke-linecap','round')
			.style("stroke-linejoin","round")
		
		const s = this.songPathGenerator(CHORD_ARRAY)
		this.songPath
			.attr('d', s)
	}
	
	songPathGenerator = d3.line()
		.curve(d3.curveLinear)
		.x(chord => this.getChordXY(chord).x)
		.y(chord => this.getChordXY(chord).y);
	
	
	getChordXY(chord) {
		const [x, y] = this.getCoordsFromIndex(circleNotesDataByNote[chord.root][this.indexType], true)
		return {x, y}
	}

// Coord Calculations
	getCoordsFromIndex(index, jitter = false) {
		const increment = 2 * Math.PI / circleNotesData.length
		const angle = increment * index
		const radius = 200
		const [x, y] = d3.pointRadial(angle, radius)
		const _jitter = jitter ? Math.random() * 16 : 0
		return [x + width/2 + _jitter, y + height/2 + _jitter]
	}
	
	updateCircleNotesData() {
		circleNotesData.forEach(d => {
			const [x, y] = this.getCoordsFromIndex(d[this.indexType])
			d.x = x
			d.y = y
			d.color = colorScale(d['chromaticIndex']) // Keep color constant regardless of fifths or chromatic
		})
	}
	
	runPathDrawingAnimation() {
		// https://observablehq.com/@lemonnish/svg-path-animations-d3-transition
		var totalLength = this.songPath.node().getTotalLength();
		
		this.songPath
			.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(PATH_DRAWING_ANIMATION_DURATION)
			.ease(d3.easeLinear)
			.attr("stroke-dashoffset", 0)
	}
	
	toggleCircle() {
		console.log('TOGGLING')
		
		this.indexType = this.indexType === 'chromaticIndex' ? 'fifthsIndex' : 'chromaticIndex'
		d3.select('#circle-type').html(this.indexType)
		
		// Transition to updated state
		this.noteGroup.transition().duration(CIRCLE_OF_FOURTHS_TRANSITION_DURATION)
		// .delay((d, i) => i * 50) // To coordinate w/ songPath, we'd need to transition to a NEW line for each point in the line
			.attr("transform", d => `translate(${d.x},${d.y})`)
		
		
		// If paths exists, transition it to this new state.
		const songPathGeneratorRef = this.songPathGenerator
		const CHORD_ARRAY_ref = this.CHORD_ARRAY
		this.songPath
			.transition()
			.duration(CIRCLE_OF_FOURTHS_TRANSITION_DURATION)
			.attrTween('d', function (d) { // SOURCE/PLUGIN: https://github.com/pbeshai/d3-interpolate-path
				var previous = d3.select(this).attr('d');
				var current = songPathGeneratorRef(CHORD_ARRAY_ref);
				
				return d3.interpolatePath(previous, current);
			})
			.on('end', _ => this.runPathDrawingAnimation())
	}
}

const viz = new ChordViz(CHORD_PROGRESSIONS.AUTUMN_LEAVES, '#vis-container')

viz.toggleCircle()
