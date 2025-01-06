const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const state = require('./game_state.js')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(express.static('public'))

const PORT = process.env.PORT || 3003
// this needs to be server, NOT app... 
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

io.on('connection', (socket) => {
    // TODO place in a room based on ID.

    // Handle custom events
    socket.on('message', (data) => {
      console.log('Message from client:', data)
    })

    socket.on('new_game', () => {
        const game_id = state.new_game()

        socket.emit('game_id', game_id)
        socket.emit('update_board', state.get_board(game_id))
        socket.emit('update_pieces', state.get_pieces(game_id))
    })

    socket.on('move', (data) => {
        const {game_id, piece_start, piece_end, player_side} = data
        let res_data = state.server_move(game_id, piece_start, piece_end, player_side)
        socket.emit('update_pieces', res_data.pieces_arr)
        socket.emit('display_player_msg', res_data.player_message)
        socket.emit('display_opponent_msg', res_data.opponent_message)
    })

    socket.on('disconnect', () => {
        console.log('DEBUG: User disconnected')
    })
})