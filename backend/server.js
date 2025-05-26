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
            console.log('Getting players for game:', gameCode);
            
            // First check if the game exists
            const exists = await mongoDao.gameExists(gameCode);
            if (!exists) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            
            // Get players from database for this game code
            const players = await mongoDao.getPlayersInGame(gameCode);
            console.log('Found players:', players);
            
            // Send players list back to THIS client only
            socket.emit('players list', players);
        } catch (error) {
            console.error('Error getting players:', error);
            socket.emit('error', { message: 'Failed to get players' });
        }
    });
  
    // When a client joins a game
    socket.on('join game', async (data) => {
        try {
            console.log('Player joining game:', data);
            
            // Validate that game exists before allowing join
            const exists = await mongoDao.gameExists(data.gameCode);
            if (!exists) {
                socket.emit('error', { message: 'Game not found. Please check your game code.' });
                return;
            }
            
            // Save player to database
            await mongoDao.joinGame({
                playerName: data.playerName,
                gameCode: data.gameCode,
                isCreator: false  // Explicitly set as not creator
            });
            
            console.log('Player successfully joined');
            
            // Send success confirmation to the player who just joined
            socket.emit('join success', {
                playerName: data.playerName,
                gameCode: data.gameCode
            });
            
            // Get updated players list
            const updatedPlayers = await mongoDao.getPlayersInGame(data.gameCode);
            console.log('Broadcasting updated players:', updatedPlayers);
            
            // Broadcast updated players list to ALL clients
            io.emit('game updated', {
                gameCode: data.gameCode,
                players: updatedPlayers
            });
            
        } catch (error) {
            console.error('Error joining game:', error);
            if (error.message.includes("E11000")) {
                socket.emit('error', { message: 'Player name already exists in this game' });
            } else {
                socket.emit('error', { message: 'Failed to join game' });
            }
        }
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
})

// Start server
server.listen(3004, () => {
    console.log("Server running on port 3004")
})