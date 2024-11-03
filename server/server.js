const express = require('express')
const path = require('path')
const http = require('http')
const io = require('socket.io')

const state = require('./game_state.js')

// 1. Socket.io
// 2. Maintain game state
// 3. broadcast events (like moves)

// change server functions to socket functions

const app = express()
const server = http.createServer(app)
const io = socketIo(server)
const PORT = process.env.PORT || 3000

// middleware 
app.use(express.json()) // for JSON bodies
app.use(express.urlencoded({ extended: true })) // url encoded bodies
app.use(express.static(path.join(__dirname, '../client'))) // serve static files

// start the server listening on a port
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

// routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'))
})

// creates a socket object on user connection
io.on('connection', (socket) => {
    console.log('DEBUG: A user connected')

    socket.on('new_game', () => {
        socket.emit('update_board', state.new_board())
        socket.emit('update_pieces', state.new_pieces())
    })

    socket.on('move', (data) => {  // not doing req/ res anymore, just data in
        const {piece_start, piece_end, player_side} = data
        let res = state.server_move(piece_start, piece_end, player_side)
        socket.emit('update_pieces', res)
    })

    socket.on('disconnect', () => {
        console.log('DEBUG: User disconnected')
    })
})