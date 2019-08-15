const { YesIntentFlow, NoIntentFlow } = require("../classes");

const CHOICES = ["rock", "paper", "scissors"];
const HIGH_WINS_LIMIT = 10;

let yesIntentTransition = new YesIntentFlow();
let noIntentTransition = new NoIntentFlow();

function register(voxaApp) {
  voxaApp.onIntent("LaunchIntent", () => {
    return {
      flow: "continue",
      reply: "Welcome",
      to: "askHowManyWins",
    };
  });

  voxaApp.onState("askHowManyWins", () => {
    return {
      flow: "yield",
      reply: "AskHowManyWins",
      to: "getHowManyWins",
    };
  });

  voxaApp.onState("getHowManyWins", voxaEvent => {
    if (voxaEvent.intent.name === "MaxWinsIntent") {
      voxaEvent.model.wins = voxaEvent.intent.params.wins;
      voxaEvent.model.userWins = 0;
      voxaEvent.model.alexaWins = 0;

      if (voxaEvent.model.wins > HIGH_WINS_LIMIT) {
        yesIntentTransition.setValues({
          flow: "continue",
          reply: "StartGame",
          to: "askUserChoice",
        });
        noIntentTransition.setValues({
          flow: "continue",
          reply: "StartGame",
          to: "askHowManyWins",
        });

        return {
          flow: "yield",
          reply: "HighWinsLimit",
          to: "askForConfirmation",
        };
      }

      return {
        flow: "continue",
        reply: "StartGame",
        to: "askUserChoice",
      };
    }
  });

  voxaApp.onState("askUserChoice", voxaEvent => {
    const userWon =
      parseInt(voxaEvent.model.userWins) >= parseInt(voxaEvent.model.wins);
    const alexaWon =
      parseInt(voxaEvent.model.alexaWins) >= parseInt(voxaEvent.model.wins);

    if (userWon) {
      return {
        flow: "continue",
        reply: "UserWinsTheGame",
        to: "askIfStartANewGame",
      };
    }

    if (alexaWon) {
      return {
        flow: "continue",
        reply: "AlexaWinsTheGame",
        to: "askIfStartANewGame",
      };
    }

    const min = 0;
    const max = CHOICES.length - 1;
    voxaEvent.model.userChoice = undefined;
    voxaEvent.model.alexaChoice =
      Math.floor(Math.random() * (max - min + 1)) + min;

    return {
      flow: "yield",
      reply: "AskUserChoice",
      to: "getUserChoice",
    };
  });

  voxaApp.onState("getUserChoice", voxaEvent => {
    if (voxaEvent.intent.name === "RockIntent") {
      voxaEvent.model.userChoice = "rock";
    } else if (voxaEvent.intent.name === "PaperIntent") {
      voxaEvent.model.userChoice = "paper";
    } else if (voxaEvent.intent.name === "ScissorsIntent") {
      voxaEvent.model.userChoice = "scissors";
    }

    if (voxaEvent.model.userChoice) {
      return {
        flow: "continue",
        to: "processWinner",
      };
    }
  });

  voxaApp.onState("processWinner", voxaEvent => {
    const alexaChoice = CHOICES[voxaEvent.model.alexaChoice];
    const { userChoice } = voxaEvent.model;
    let reply = "TiedResult";

    if (alexaChoice === userChoice) {
      return {
        flow: "continue",
        reply,
        to: "askUserChoice",
      };
    }

    if (alexaChoice === "rock") {
      if (userChoice === "paper") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "scissors") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    if (alexaChoice === "paper") {
      if (userChoice === "scissors") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "rock") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    if (alexaChoice === "scissors") {
      if (userChoice === "rock") {
        voxaEvent.model.userWins += 1;
        reply = "UserWins";
      }

      if (userChoice === "paper") {
        voxaEvent.model.alexaWins += 1;
        reply = "AlexaWins";
      }
    }

    return {
      flow: "continue",
      reply,
      to: "askUserChoice",
    };
  });

  voxaApp.onState("askIfStartANewGame", () => {
    return {
      flow: "continue",
      to: "shouldStartANewGame",
    };
  });

  voxaApp.onState("shouldStartANewGame", () => {
    yesIntentTransition.setValues();
    noIntentTransition.setValues();

    return {
      flow: "yield",
      reply: "AskIfStartANewGame",
      to: "askForConfirmation",
    };
  });

  voxaApp.onState("askForConfirmation", voxaEvent => {
    if (voxaEvent.intent.name === "YesIntent") {
      return yesIntentTransition;
    }

    if (voxaEvent.intent.name === "NoIntent") {
      return noIntentTransition;
    }
  });

  voxaApp.onIntent("ScoreIntent", voxaEvent => {
    if (!voxaEvent.model.wins) {
      return {
        flow: "yield",
        reply: "NoWinsDefined",
        to: "getHowManyWins",
      };
    }

    const totalGamesPlayed =
      voxaEvent.model.userWins + voxaEvent.model.alexaWins;
    if (!totalGamesPlayed) {
      return {
        flow: "continue",
        reply: "NoGamesPlayed",
        to: "askToContinueGame",
      };
    }

    return {
      flow: "continue",
      reply: "Score",
      to: "askToContinueGame",
    };
  });

  voxaApp.onState("askToContinueGame", () => {
    yesIntentTransition.setValues({ to: "askUserChoice" });
    noIntentTransition.setValues();

    return {
      flow: "yield",
      reply: "AskToContinue",
      to: "askForConfirmation",
    };
  });

  voxaApp.onIntent("NewGameIntent", voxaEvent => {
    const totalGamesPlayed =
      voxaEvent.model.userWins + voxaEvent.model.alexaWins;

    if (totalGamesPlayed > 0) {
      yesIntentTransition.setValues();
      noIntentTransition.setValues({
        flow: "continue",
        reply: "StartGame",
        to: "askUserChoice",
      });

      return {
        flow: "yield",
        reply: "NewGameConfirmation",
        to: "askForConfirmation",
      };
    }

    return {
      flow: "continue",
      reply: "RestartGame",
      to: "askHowManyWins",
    };
  });

  voxaApp.onIntent("HelpIntent", () => {
    return {
      flow: "continue",
      reply: "Help",
      to: "askToContinueGame",
    };
  });

  voxaApp.onIntent("FallbackIntent", () => {
    return {
      flow: "continue",
      reply: "Fallback",
      to: "askToContinueGame",
    };
  });

  voxaApp.onIntent("CancelIntent", () => {
    return {
      flow: "terminate",
      reply: "Bye",
    };
  });

  voxaApp.onIntent("StopIntent", () => {
    return {
      flow: "terminate",
      reply: "Bye",
    };
  });
}

module.exports = register;
