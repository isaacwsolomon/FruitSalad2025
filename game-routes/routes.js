// routes/gameRoutes.js
const express = require('express')
const router = express.Router()

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

// Utility function
function createRandomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

module.exports = router