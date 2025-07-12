// routes/gameRoutes.js
const express = require('express')
const router = express.Router()
const mongoDao = require('./mongoDao');

// Route for the home page
router.get("/", (req, res) => {
    res.render("index")
})

// Route for join game page
router.get("/join-game", (req, res) => {
    res.render("join-game")
})

// Route for create game page
router.get("/create-game", (req, res) => {
    const gameCode = createRandomString(5)
    res.render("create-game", { gameCode })
})

// Waiting room route with game code validation
router.get("/waiting-room", async (req, res) => {
    const gameCode = req.query.gameCode || ""
    const isCreator = req.query.creator === 'true' // Check if user is creator
    
    if (!gameCode) {
        return res.status(400).send("Game code is required")
    }
    
    try {
        // Check if the game exists
        const exists = await mongoDao.gameExists(gameCode)
        if (!exists) {
            return res.status(404).send("Game not found. Please check your game code.")
        }
        // get game settings to pass cards per player limit
        const gameSettings = await mongoDao.getGameSettings(gameCode)
        // If no game found default to 5 cards per player
        const cardsPerPlayer = gameSettings ? gameSettings.cardsPerPlayer: 5
        
        // Pass both gameCode AND isCreator to the template and cardsPerPlayer
        res.render("waiting-room", { gameCode, isCreator, cardsPerPlayer })
    } catch (error) {
        console.error("Error checking game:", error)
        res.status(500).send("Error accessing game")
    }
})

// Waiting room form submission 
router.post('/waiting-room', async (req, res) => {
    const { playerName, gameCode } = req.body
    console.log("Joining game with:", playerName, gameCode)
    
    try {
        // Check if game exists before allowing join
        const exists = await mongoDao.gameExists(gameCode)
        if (!exists) {
            return res.status(404).send("Game not found. Please check your game code.")
        }
        
        await mongoDao.joinGame({ playerName, gameCode })
        res.redirect(`/waiting-room?gameCode=${gameCode}`)
    } catch (error) {
        if (error.message.includes("E11000")) {
            res.status(400).send("Error: Player name already exists in this game")
        } else {
            console.error("Database error:", error)
            res.status(500).send(error.message)
        }
    }
})

// Join with game code validation
router.post('/join-game', async (req, res) => {
    const { gameCode } = req.body
    console.log("Attempting to join game with code:", gameCode)
    
    try {
        // Check if the game exists
        const exists = await mongoDao.gameExists(gameCode)
        if (!exists) {
            return res.status(404).send("Game not found. Please check your game code and try again.")
        }
        
        // If game exists, redirect to waiting room
        res.redirect(`/waiting-room?gameCode=${gameCode}&creator=false`)
    } catch (error) {
        console.error("Error checking game:", error)
        res.status(500).send("Error accessing game")
    }
})

// Create game form submission - this actually creates the game
router.post('/create-game', async (req, res) => {
    const { playerName, gameCode, cardsPerPlayer } = req.body
    console.log("Creating game with:", playerName, gameCode, "Cards per player: ", cardsPerPlayer)
    
    // Ensure cardsPerPlayer has a default value if not provided
    const cards = cardsPerPlayer || 5;
    try {
        // Create the game with the creator as first player
        await mongoDao.createGame(gameCode, playerName, cards)
        res.redirect(`/waiting-room?gameCode=${gameCode}&creator=true`)
    } catch (error) {
        if (error.message.includes("E11000")) {
            res.status(400).send("Error: Game code already exists. Please try again.")
        } else {
            console.error("Database error:", error)
            res.status(500).send(error.message)
        }
    }
})

// Creates random string 
function createRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

module.exports = router