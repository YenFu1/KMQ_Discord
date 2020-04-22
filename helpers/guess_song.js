const { sendSongMessage, getUserIdentifier, cleanSongName, startGame, playEpicSound } = require("./utils.js");

module.exports = ({ client, message, gameSessions, guildPreference, db }) => {
    let guess = cleanSongName(message.content);
    let gameSession = gameSessions[message.guild.id];
    if (gameSession.getSong() && guess === cleanSongName(gameSession.getSong())) {
        // this should be atomic
        playEpicSound(gameSession, guildPreference, message);
        let userTag = getUserIdentifier(message.author);
        gameSession.scoreboard.updateScoreboard(userTag, message.author.id);
        sendSongMessage(message, gameSession, false);
        gameSession.endRound();
        startGame(gameSession, guildPreference, db, message);
    }
}

