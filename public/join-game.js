const mongoDao = require('../backend/mongoDao')

const socket = io('http://localhost:3004')
// Listens to any event that runs everytime connect to server
socket.on('connect', ()=>{
    displayMessage(`You connected with id: ${socket.id}`)
})

socket.emit(`player-name`, "hi")

