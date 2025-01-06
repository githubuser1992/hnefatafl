const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(express.static('public'))

const PORT = process.env.PORT || 3003
// this needs to be server, NOT app
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

io.on('connection', (socket) => {
    console.log('DEBUG: A user connected')

    // Handle custom events
    socket.on('message', (data) => {
      console.log('Message from client:', data)
    })

    socket.on('new_game', () => {
        const game_id = state.new_game()

        socket.emit('game_id', game_id)
        socket.emit('update_board', state.game_states[game_id])
        socket.emit('update_pieces', state.game_states[game_id])
    })

    socket.on('move', (data) => {
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