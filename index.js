const CHORD_PROGRESSIONS = {
  "Autumn Leaves": [
    // A
    { root: "A" },
    { root: "D" },
    { root: "G" },
    { root: "C" },
    { root: "Fsharp" },
    { root: "B" },
    { root: "E" },

    // B
    { root: "Fsharp" },
    { root: "B" },
    { root: "E" },

    { root: "A" },
    { root: "D" },
    { root: "G" },

    { root: "Fsharp" },
    { root: "B" },
    { root: "E" },
    { root: "Eflat" },
    { root: "D" },
    { root: "Csharp" },
    { root: "C" },
    { root: "B" },
    { root: "E" },
  ],

  "Guitar Strings": [
    { root: "E" },
    { root: "A" },
    { root: "D" },
    { root: "G" },
    { root: "B" },
    { root: "E" },
  ],

  "Circle of Fourths from E": [
    { root: "E" },
    { root: "A" },
    { root: "D" },
    { root: "G" },
    { root: "C" },
    { root: "F" },
  ],

  "I'm Yours Chords": [
    { root: "G" },
    { root: "D" },
    { root: "A" },
    { root: "C" },
  ],

  "Rolling in the Deep Verse": [
    // verse
    { root: "A" },
    { root: "E" },
    { root: "G" },
    { root: "E" },
    { root: "G" },
    { root: "A" },
    { root: "E" },
    { root: "G" },
    { root: "E" },
    { root: "G" },

    // chorus
    { root: "A" },
    { root: "G" },
    { root: "F" },
    { root: "G" },
    { root: "A" },
    { root: "G" },
    { root: "F" },
    { root: "G" },
  ],
};

const VIS_CONTAINER = "#vis-container";
Object.keys(CHORD_PROGRESSIONS).forEach((chordProgressionName) => {
  new ChordViz(
    CHORD_PROGRESSIONS[chordProgressionName],
    chordProgressionName,
    VIS_CONTAINER
  );
});
