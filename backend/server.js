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
const { SocketAddress } = require('net')
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
    // get players current submission count 
    socket.on('get submission count', async (data) =>{
        try{
            const count = await mongoDao.getPlayerSubmissionCount(data.gameCode, data.playerName);
            socket.emit('submission count', {
                gameCode: data.gameCode,
                playerName: data.playerName,
                count:count
            
            });
        } catch(error){
            console.error('Error getting submission count: ', error);
            socket.emit('error', {message: 'Failed to get submission count'});
        }
    });
    // Handle sentence submission 
    socket.on('submit sentence', async (data) => {
        try{
            console.log('Sentence submission: ', data);
            // validate that game exists 
            const exists = await mongoDao.gameExists(data.gameCode);
            if(!exists){
                socket.emit('error', {message: 'Game not found'});
                return;
            }

            // get game settings to check card limit
            const gameSettings = await mongoDao.getGameSettings(data.gameCode);
            const cardsPerPlayer = gameSettings ? gameSettings.cardsPerPlayer :5;

            // Check if player has reached submission limit 
            const currentCount = await mongoDao.getPlayerSubmissionCount(data.gameCode, data.playerName);
            if(currentCount >= cardsPerPlayer){
                socket.emit('error', {message: 'You have reached maxium number of submissions '});
                return;
            }
            // save submission 
            await mongoDao.submitSentence(data.gameCode, data.playerName, data.sentence);
            //get updated submission count
            const newCount = await mongoDao.getPlayerSubmissionCount(data.gameCode, data.playerName);

            // send success confirmation 
            socket.emit('submission success', {
                gameCode: data.gameCode,
                playerName: data.playerName,
                newCount: newCount,
                maxCount: cardsPerPlayer
            });

            //Broadcast to all clients that submission was mafe 
            io.emit('submission update', {
                gameCode: data.gameCode,
                playerName: data.playerName,
                submissionCount: newCount,
                maxCount: cardsPerPlayer
            });
        }catch (error){
        console.error('error submitting sentence: ', error);
        socket.emit('error', {message: 'Failed to submit sentence'});
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