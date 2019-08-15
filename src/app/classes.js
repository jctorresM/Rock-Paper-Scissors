class Intent {
  constructor() {
    this.flow;
    this.reply;
    this.to;
  }
}

class YesIntentFlow extends Intent {
  constructor() {
    super();
    this.setValues();
  }

  setValues(values) {
    this.flow = values && values.flow ? values.flow : "continue";
    this.reply = values && values.reply ? values.reply : "RestartGame";
    this.to = values && values.to ? values.to : "askHowManyWins";
  }
}

class NoIntentFlow extends Intent {
  constructor() {
    super();
    this.setValues();
  }

  setValues(values) {
    this.flow = values && values.flow ? values.flow : "terminate";
    this.reply = values && values.reply ? values.reply : "Bye";
    this.to = values && values.to ? values.to : "";
  }
}

module.exports = { Intent, YesIntentFlow, NoIntentFlow };
