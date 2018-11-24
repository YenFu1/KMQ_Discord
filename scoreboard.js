const Player = require("./player.js")

module.exports = class Scoreboard {
    constructor() {
        // _players stores each entry as:
        // "USER_ID": Player {_name: "username", _value: SCORE_VAL }
        this._players = {};
        this._firstPlace = [];
        this._highestScore = 0;
    }

    getWinner() {
        let winnerStr = "";

        if (this._firstPlace.length == 1) {
            return this._firstPlace[0].getName() + " wins!";
        }

        for (let i = 0; i < this._firstPlace.length; i++) {
            if (i == this._firstPlace.length - 1) {
                // Last entry -- append just the username
                winnerStr += this._firstPlace[i].getName() + " ";
            }
            else if (i == this._firstPlace.length - 2) {
                // Second last entry -- use "and"
                winnerStr += this._firstPlace[i].getName() + " and ";
            }
            else {
                winnerStr += this._firstPlace[i].getName() + ", ";
            }
        }
        winnerStr += "win!";
        return winnerStr;
    }

    getScoreboard() {
        return Object.values(this._players).map((x) => {
            return { name: x.getName(), value: x.getScore() }
        })
            .sort((a, b) => { return b.value - a.value; })
    }

    updateScoreboard(winner, winnerID) {
        if (!this._players[winnerID]) {
            this._players[winnerID] = new Player(winner);
        }
        else {
            this._players[winnerID].incrementScore();
        }

        if (this._players[winnerID].getScore() == this._highestScore) {
            // If user is tied for first, add them to the first place array
            this._firstPlace.push(this._players[winnerID]);
        }
        else if (this._players[winnerID].getScore() > this._highestScore) {
            // If user is first, reset first place array and add them
            this._highestScore = this._players[winnerID].getScore();
            this._firstPlace = [];
            this._firstPlace.push(this._players[winnerID]);
        }
    }

    isEmpty() {
        if (Object.keys(this._players).length) return false;
        return true;
    }
};
