export enum SequencerPlayState {
  "STOPPED",
  "STARTED",
}

export enum SequencerEvents {
  ADJUST_TIME_SCALE = "ADJUST_TIME_SCALE",
  TICK = "TICK",

  ADD_NEW_RHYTHM = "ADD_NEW_RHYTHM",

  DECREMENT_BEAT = "DECREMENT_BEAT",
  DECREMENT_TICK = "DECREMENT_TICK",

  INCREMENT_BEAT = "INCREMENT_BEAT",

  INCREMENT_TICK = "INCREMENT_TICK",

  REMOVE_RHYTHM = "REMOVE_RHYTHM",

  RHYTHM_CHANGE = "RHYTHM_CHANGE",
  TOGGLE_TICK = "TOGGLE_TICK",

  FREQUENCY_CHANGE = "FREQUENCY_CHANGE",
}