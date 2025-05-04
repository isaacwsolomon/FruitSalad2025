var express = require('express')
//var mongoDao = require('./mongoDao')
var app = express()
app.use(express.static('public'));
app.set('view engine', 'ejs') // after app variable
// body-parser middleware to parse JSON and URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const { createRandomString } = require('./create-game');

// Route for the home page
app.get("/", (req, res) => {
    res.render("index"); // Render the index.ejs view
});

// Route for join game page
app.get("/join-game", (req, res) => {
    res.render("join-game");
});

// Route for create game page
app.get("/create-game", (req, res) => {
    const gameCode = createRandomString(5)
    res.render("create-game", {gameCode});
});
// Start server on 3004 
app.listen(3004, () => {
    console.log("Running on port 3004")

})

