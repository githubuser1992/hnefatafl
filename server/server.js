const express = require('express')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')

const state = require('./game_state.js')

// 1. Socket.io
// 2. Maintain game state
// 3. broadcast events (like moves)

// change server functions to socket functions
// make game state dictionary to story many game states
// make a game state object to put in dictionary, includes pieces_arr, board_arr, and player_side


const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const gameStates = new Map()

// middleware 
app.use(express.json()) // for JSON bodies
app.use(express.urlencoded({ extended: true })) // url encoded bodies
app.use(express.static(path.join(__dirname, '../client'))) // serve static files

const PORT = process.env.PORT || 3000
// start the server listening on a port
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

// routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'))
})

app.get('/socket.io-client', (req, res) => { // DEBUG
    res.sendFile('C:/Users/ndafo/Desktop/Hobbies/WebDevelopment/Hnefatafl/node_modules/socket.io/client-dist/socket.io.js'); 
});


// creates a socket object on user connection
io.on('connection', socket => {
    console.log('DEBUG: A user connected')

    socket.on('new_game', () => {
        const game_id = state.new_game(); // TODO in progress

        socket.emit('game_id', game_id)
        socket.emit('update_board', state.game_states[game_id])
        socket.emit('update_pieces', state.game_states[game_id])
    })

    socket.on('move', (data) => {  // not doing req/ res anymore, just data in
        const {piece_start, piece_end, player_side} = data
        let res_data = state.server_move(piece_start, piece_end, player_side)
        socket.emit('update_pieces', res_data)
    })

    socket.on('test', (msg) =>{
        console.log('message' + msg)
    })

    socket.on('disconnect', () => {
        console.log('DEBUG: User disconnected')
    })
})