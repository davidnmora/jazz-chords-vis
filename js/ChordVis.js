// Constants
const CIRCLE_NOTES_DATA_BY_NOTE = {
  C: { note: "C", fifthsIndex: 0, chromaticIndex: 0 },
  G: { note: "G", fifthsIndex: 1, chromaticIndex: 7 },
  D: { note: "D", fifthsIndex: 2, chromaticIndex: 2 },
  A: { note: "A", fifthsIndex: 3, chromaticIndex: 9 },
  E: { note: "E", fifthsIndex: 4, chromaticIndex: 4 },
  B: { note: "B", fifthsIndex: 5, chromaticIndex: 11 },
  Fsharp: { note: "Fsharp", fifthsIndex: 6, chromaticIndex: 6 },
  Csharp: { note: "Csharp", fifthsIndex: 7, chromaticIndex: 1 },
  Gsharp: { note: "Gsharp", fifthsIndex: 8, chromaticIndex: 8 },
  Eflat: { note: "Eflat", fifthsIndex: 9, chromaticIndex: 3 },
  Bflat: { note: "Bflat", fifthsIndex: 10, chromaticIndex: 10 },
  F: { note: "F", fifthsIndex: 11, chromaticIndex: 5 },
};
const COLORS = {
  text: "#bdc3c7",
  line: "#2ecc71",
  canvas: "#2c3e50",
};

const CIRCLE_OF_FOURTHS_TRANSITION_DURATION = 1000;
const PATH_DRAWING_ANIMATION_DURATION = 3000;

const CIRCLE_NOTES_DATA = Object.values(CIRCLE_NOTES_DATA_BY_NOTE);
const COLOR_SCALE = d3
  .scaleLinear()
  .domain([0, CIRCLE_NOTES_DATA.length])
  .range(["blue", "red"]);
const CANVAS_HEIGHT = 500,
  CANVAS_WIDTH = 500;

class ChordViz extends Object {
  constructor(chordArray, title, visContainerSelector) {
    super();
    console.log("CONSTRUCTOR");
    this.chordArray = chordArray;
    this.songPathGenerator = d3
      .line()
      .curve(d3.curveLinear)
      .x((chord) => this._getChordXY(chord).x)
      .y((chord) => this._getChordXY(chord).y);

    // Add elements to DOM
    this.visDivWrapper = d3
      .select(visContainerSelector)
      .append("div")
      .style("background-color", COLORS.canvas);
    // Append a title
    this.visDivWrapper.append("h2").style("color", COLORS.text).html(title);

    this.indexType = "fifthsIndex";
    this.toggleButton = this.visDivWrapper
      .append("button")
      .style("display", "block")
      .html(this.indexType)
      .on("click", () => {
        this.toggleCircle();
      });
    this.runPathDrawingAnimationButton = this.visDivWrapper
      .append("button")
      .style("display", "block")
      .html("redraw chord progression")
      .on("click", () => {
        this.runPathDrawingAnimation();
      });

    this.svg = this.visDivWrapper
      .append("svg")
      .attr("width", CANVAS_WIDTH)
      .attr("height", CANVAS_HEIGHT)
      .style("background-color", COLORS.canvas);

    this._updateCircleNotesData();

    this.noteGroup = this.svg
      .selectAll(".note-group")
      .data(CIRCLE_NOTES_DATA)
      .enter()
      .append("g")
      .classed("note-group", true)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    const noteCircle = this.noteGroup
      .append("circle")
      .attr("r", (d) => (d.note === "E" ? 20 : 0))
      .attr("fill", (d) => d.color);
    //   append text saying "this is the root chord"
    this.noteGroup
      .append("text")
      .attr("font-size", 12)
      .attr("dy", 14)
      .attr("dx", -20)
      .attr("fill", COLORS.text)
      .text((d) => (d.note === "E" ? "Key Center" : ""));

    const noteLabel = this.noteGroup
      .append("text")
      .attr("font-size", 46)
      .attr("fill", COLORS.text)
      .text((d) => d.note.replace("sharp", "#").replace("flat", "b"));

    this.songPath = this.svg
      .append("path")
      .classed("song-path", true)
      .attr("fill", "none")
      .attr("stroke", COLORS.line)
      .attr("stroke-width", 4)
      .attr("stroke-opacity", 0.2)
      .style("stroke-linecap", "round")
      .style("stroke-linejoin", "round");

    const s = this.songPathGenerator(chordArray);
    this.songPath.attr("d", s);
  }

  _getChordXY(chord) {
    const [x, y] = this._getCoordsFromIndex(
      CIRCLE_NOTES_DATA_BY_NOTE[chord.root][this.indexType],
      true
    );
    return { x, y };
  }

  // Coord Calculations
  _getCoordsFromIndex(index, jitter = false) {
    const increment = (2 * Math.PI) / CIRCLE_NOTES_DATA.length;
    const angle = increment * index;
    const radius = 200;
    const [x, y] = d3.pointRadial(angle, radius);
    const _jitter = jitter ? Math.random() * 16 : 0;
    return [x + CANVAS_WIDTH / 2 + _jitter, y + CANVAS_HEIGHT / 2 + _jitter];
  }

  _updateCircleNotesData() {
    CIRCLE_NOTES_DATA.forEach((d) => {
      const [x, y] = this._getCoordsFromIndex(d[this.indexType]);
      d.x = x;
      d.y = y;
      d.color = COLOR_SCALE(d["chromaticIndex"]); // Keep color constant regardless of fifths or chromatic
    });
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
      .attr("stroke-dashoffset", 0);
  }

  toggleCircle() {
    console.log("TOGGLING");

    this._updateCircleNotesData();

    this.indexType =
      this.indexType === "chromaticIndex" ? "fifthsIndex" : "chromaticIndex";
    this.toggleButton.html(this.indexType);

    // Transition to updated state
    this.noteGroup
      .transition()
      .duration(CIRCLE_OF_FOURTHS_TRANSITION_DURATION)
      // .delay((d, i) => i * 50) // To coordinate w/ songPath, we'd need to transition to a NEW line for each point in the line
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // If paths exists, transition it to this new state.
    const songPathGeneratorRef = this.songPathGenerator;
    const chordArray_ref = this.chordArray;
    this.songPath
      .transition()
      .duration(CIRCLE_OF_FOURTHS_TRANSITION_DURATION)
      .attrTween("d", function (d) {
        // SOURCE/PLUGIN: https://github.com/pbeshai/d3-interpolate-path
        var previous = d3.select(this).attr("d");
        var current = songPathGeneratorRef(chordArray_ref);

        return d3.interpolatePath(previous, current);
      });
  }
}
