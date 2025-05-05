    // server.js
    const express = require('express')
    const app = express()
    const http = require('http')
    const server = http.createServer(app)
    const io = require('socket.io')(server)
    const mongoDao = require('./mongoDao')

    // Middleware setup
    app.use(express.static('public'))
    app.set('view engine', 'ejs')
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // // Socket.IO event handlers
    // io.on('connection', socket => {
    //     console.log('Client connected:', socket.id)
        
    //     socket.on('player-name', (string) => {
    //         console.log('Player name received:', string)
    //     })
        
    //     socket.on('disconnect', () => {
    //         console.log('Client disconnected:', socket.id)
    //     })
    // })

    // Import and use routes
    const gameRoutes = require('./game-routes/routes')
    app.use('/', gameRoutes)

    // Start server
    server.listen(3004, () => {
        console.log("Server running on port 3004")
    })