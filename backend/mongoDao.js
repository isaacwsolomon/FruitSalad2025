const MongoClient = require('mongodb').MongoClient
// Declare the collection variables
let db, coll, gamesColl, submissionsColl;
MongoClient.connect('mongodb+srv://admin:admin@fruitsalad.8eeyqzf.mongodb.net/?retryWrites=true&w=majority&appName=FruitSalad')
.then((client) => {
    db = client.db('FruitSalad')
    coll = db.collection('gamedetails')
    gamesColl = db.collection('games') // Collectuon for game settings
    submissionsColl = db.collection('submissions') //Collection for player submissions
})
.catch((error) => {
    console.log(error.message)
})

var joinGame = function(gameData){
    return new Promise((resolve,reject) => {
        // Ensure isCreator is set to false for regular joins
        const playerData = {
            ...gameData,
            isCreator: gameData.isCreator || false,
            joinedAt: new Date()
        };
        
        // Inserts item into collection 
        coll.insertOne(playerData)
        .then((documents) => {
            // Resolve promise
            resolve(documents)
        })
        // Reject promise if error
        .catch((error) => {
            reject(error)
        })
    })
}

// Get all players in a specific game
var getPlayersInGame = function(gameCode) {
    return new Promise((resolve, reject) => {
        // Find all documents with the given gameCode, sorted by join time
        coll.find({ gameCode: gameCode })
            .sort({ createdAt: 1, joinedAt: 1 }) // Creator first, then by join time
            .toArray()
        .then((players) => {
            resolve(players)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Check if a game exists - has a player in it 
var gameExists = function(gameCode) {
    return new Promise((resolve, reject) => {
        coll.findOne({ gameCode: gameCode })
        .then((game) => {
            resolve(!!game) // Returns true if game exists, false if not
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Create a new game - called when creating a game
var createGame = function(gameCode, creatorName, cardsPerPlayer) {
    return new Promise((resolve, reject) => {
        gamesColl.insertOne({
            gameCode: gameCode,
            cardsPerPlayer: parseInt(cardsPerPlayer),
            createdAt: new Date(),
            status: 'waiting' // waiting, playing, finsihed
        })
        .then(() =>{
            // Insert the game creator as the first player
            return coll.insertOne({ 
                gameCode: gameCode, 
                playerName: creatorName,
                isCreator: true,
                createdAt: new Date()
            })
        })
        
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Get game settings including cards per player
var getGameSettings = function(gameCode){
    return new Promise((resolve, reject) => {
        gamesColl.findOne({gameCode : gameCode})
        .then((game) => {
            resolve(game)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

// Submit a sentence for a player
var submitSentence = function(gameCode, playerName, sentence){
    return new Promise((resolve, reject) => {
        submissionsColl.insertOne({
            gameCode: gameCode,
            playerName: playerName,
            sentence: sentence,
            submittedAt: new Date()
        })
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}
// getPlayerSubmissionCount
var getPlayerSubmissionCount = function(gameCode, playerName){
    return new Promise((resolve, reject) => {
        submissionsColl.countDocuments({
            gameCode: gameCode,
            playerName: playerName
        })
        .then((count) => {
            resolve(count)
        })
        .catch((error) =>{
            reject(error)
        })
    })
}
// get all submissions 
var getGameSubmissions = function(gameCode){
    return new Promise((resolve, reject) => {
        submissionsColl.find({gameCode: gameCode})
        .sort({submittedAt: 1})
        .toArray()
        .then((submissions) => {
            resolve(submissions)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

module.exports = {joinGame, getPlayersInGame, gameExists, createGame, getGameSettings, submitSentence, getPlayerSubmissionCount, getGameSubmissions}