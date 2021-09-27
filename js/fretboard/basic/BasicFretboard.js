import { DomElem } from "../components/DomElem.js";
import { Fretboard } from "../components/Fretboard.js";

export class BasicFretboard extends Fretboard {
  constructor({ stringLanes, DomElemProps = {}, generalSounds, exactSounds } = {}) {
    super({ strings: stringLanes, generalSounds, exactSounds }); // Basic String Lane instances
    Object.assign(this, new DomElem(DomElemProps)); // "Multiple inheritance"
  }

  static init() {
    Object.getOwnPropertyNames( DomElem.prototype ).forEach(method => {
      if(method !== "constructor")
        BasicFretboard.prototype[method] = DomElem.prototype[method];
    });
  }

  createStringAtIndex(string, index) {
    index = this.stringInstances?.length ?? 0;

    const newString = string.createLane(this.elem);

    if(index === this.stringInstances.length)
      this.createInTarget({ element: newString });

    else if(index === 0)
      this.createInTarget({ element: newString, atBeginning: true });

    else
      this.createBefore({ element: newString, before: this.stringInstances[index] });

    this.addString(newString, index);
    return this;
  }

  removeFretboard() {
    this.removeStrings()
      .remove();

    return this;
  }

  removeString(string, removeDom = true, removeFromTuning = true) {
    if(this.findStringIndex(string) < 0)
      throw "String does not exist";

    if (removeDom)
      string.remove();

    if(removeFromTuning)
      super.removeString(string);

    return this;
  }

  // alternative to removeString method in case of using string index from stringInstances array instead of instance itself
  removeStringByIndex = (index = this.stringInstances.length - 1, removeDom = true, removeFromTuning = true) =>
    this.removeString(this.stringInstances[index], removeDom, removeFromTuning);

  // Creates "marks" of sounds on corresponding frets. Shows the scale on fretboard in short.
  // Adds sound marks for EVERY sound on ALL strings!
  addSoundMarksOnStrings() {
    this.stringInstances.forEach(string => this.addSoundMarksOnString(string));

    return this;
  }

  // Adds sound marks on one specific string. "string" parameter is a StringLane instance
  addSoundMarksOnString(string) {
    string.clearAllFrets();

    this.generalSounds.sounds.forEach((sound, index) => {
      if (sound)
        string.markSound(index);
    });

    this.exactSounds.sounds.forEach(sound => string.markExactSound(sound));

    return this;
  }

  getOutdatedStringLanes() {
    return this.stringInstances.filter(lane => lane.isTuningOutdated());
  }

  selfCheck(refreshMarks = true) {
    this.getOutdatedStringLanes().forEach(lane => {
      lane.updateTuning();

      if(refreshMarks)
        this.addSoundMarksOnString(lane);
    });
  }

  reloadFretText() {
    this.stringInstances.forEach(lane => lane.reloadFretText());
  }

  setNamingConvention(convention, reload = true) {
    this.stringInstances.forEach(lane => lane.namingConvention = convention);

    if(reload)
      this.reloadFretText();
  }

  setFretClick(callback) {
    this.stringInstances.forEach(lane => lane.callback = callback);
  }

  clearAllFrets() {
    this.stringInstances.forEach(string => string.clearAllFrets());
    return this;
  }
}
