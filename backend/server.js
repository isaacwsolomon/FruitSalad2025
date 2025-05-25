    // server.js
    const express = require('express')
    const app = express()
    const http = require('http')
    const server = http.createServer(app)
    
    const mongoDao = require('./mongoDao')
    const io = require('socket.io')(server)
    // Middleware setup
    app.use(express.static('public'))
    app.set('view engine', 'ejs')
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

  
    // Import and use routes
    const gameRoutes = require('./routes')
    app.use('/', gameRoutes)

    

// Socket.IO event handlers
io.on('connection', socket => {
    console.log('Client connected:', socket.id)

    // When a client requests players for a game
    socket.on('get players', async (gameCode) => {
        try {
            const players = await mongoDao.getPlayersInGame(gameCode);
            socket.emit('players list', players);
        } catch (error) {
            console.error('Error getting players:', error);
            socket.emit('players list', []);
        }
    });
  
    // When a client joins a game
    socket.on('join game', async (data) => {
        try {
            await mongoDao.joinGame({
                playerName: data.playerName,
                gameCode: data.gameCode
            });
            
            // Get updated players list and broadcast to all clients
            const updatedPlayers = await mongoDao.getPlayersInGame(data.gameCode);
            io.emit('players list', updatedPlayers);
            
            // Also emit player joined event for any additional handling
            io.emit('player joined', {
                playerName: data.playerName,
                gameCode: data.gameCode
            });
        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });
})
    // Start server
    server.listen(3004, () => {
        console.log("Server running on port 3004")
    })