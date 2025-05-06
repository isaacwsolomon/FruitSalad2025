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

router.get("/waiting-room", (req,res) => {
     // Get gameCode from query parameter
     const gameCode = req.query.gameCode || ""
     res.render("waiting-room", { gameCode })
})

// Waiting room form submission 
router.post('/waiting-room', (req, res) => {
    const { playerName, gameCode } = req.body
    console.log("Joining game with:", playerName, gameCode)
    
    mongoDao.joinGame({ playerName, gameCode })
    .then((result) => {
        res.redirect('/waiting-room') 
    })
    .catch((error) => {
        if (error.message.includes("E11000")) {
            res.status(400).send("Error: Game or player name already exists")
        } else {
            console.error("Database error:", error)
            res.status(500).send(error.message)
        }
    })
})
// Join with game code 
router.post('/join-game', (req, res) => {
    const { gameCode } = req.body
    console.log("Joining game with:", gameCode)
    
    //res.redirect("/waiting-room")
    // Pass gameCode as query parameter to waiting room
    res.redirect(`/waiting-room?gameCode=${gameCode}`)
})

// Join game form submission for player creating game 
router.post('/create-game', (req, res) => {
    const { playerName, gameCode } = req.body
    console.log("Joining game with:", playerName, gameCode)
    
    mongoDao.joinGame({ playerName, gameCode })
    .then((result) => {
        res.redirect('/waiting-room') 
    })
    .catch((error) => {
        if (error.message.includes("E11000")) {
            res.status(400).send("Error: Game or player name already exists")
        } else {
            console.error("Database error:", error)
            res.status(500).send(error.message)
        }
    })
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