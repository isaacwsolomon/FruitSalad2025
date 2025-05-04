var express = require('express')
var mongoDao = require('./mongoDao')
var app = express()
app.use(express.static('public'));
app.set('view engine', 'ejs') // after app variable
// body-parser middleware to parse JSON and URL-encoded bodies
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const io = require('socket.io')(server)

//Runs everytime client connects to server
io.on('connection', socket =>{
    console.log(socket.id)
})
// Start server on 3004 
const server = app.listen(3004, () => {
    console.log("Running on port 3004")

})
