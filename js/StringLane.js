import { uuidv4 } from "./utils.js";
import {flats, Sound, sounds} from "./Sound.js";

export class StringLane extends Sound {
  constructor({ sound = 'A', octave = 4, frets = 12 }) {
    super(sound, octave);

    this.id = uuidv4(); // StringLane has an id in case of two strings with the same sound and octave in 1 fretboard
    this.frets = frets;
  }

  static bulkConstructor(soundProps, frets){
    return soundProps.map(({ sound, octave }) => new StringLane({ sound, octave, frets }));
  }

  findSoundPlace(soundIndex) {
    const places = [];
    const currentTuning = sounds.indexOf(this.sound);
    const diff = currentTuning - soundIndex;
    let currentToPush = diff <= 0 ? Math.abs(diff) : 12 - diff;

    while(this.frets >= currentToPush){
      places.push(currentToPush);
      currentToPush += 12;
    }

    return places;
  }

  findSoundByPlace(fretIndex) {
    const dist = this.getDistanceFromNote() + fretIndex;
    const note = Sound.getNoteFromDistance(dist);
    const octave = Sound.getOctaveFromDistance(dist);

    return new Sound(note, octave);
  }

  #copySoundData(soundData){
    const { sound, octave, soundIndex, flatNote, flatOctave } = soundData;

    this.sound = sound;
    this.octave = octave;
    this.soundIndex = soundIndex;
    this.flatNote = flatNote;
    this.flatOctave = flatOctave;
  }

  // can be just a Sound instance as well
  updateTuning(sound, octave) {
    const soundData = sound instanceof Sound ? sound : new Sound(sound, octave);
    this.#copySoundData(soundData);

    return this;
  }

  findSoundOctavePlace = sound => this.distanceBetweenNotes(sound);
}
