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
    })
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
          console.log('user disconnected');
        });
      });
      io.on('connection', (socket) => {
        socket.on('chat message', (msg) => {
          console.log('message: ' + msg);
        });
      });
    // Start server
    server.listen(3004, () => {
        console.log("Server running on port 3004")
    })