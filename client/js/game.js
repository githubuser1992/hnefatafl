// handle game logic client-side

import { update_board, update_pieces } from './ui.js';

const socket = io()


// tell the server that a player has tried to move a piece
// move comes from a board listener in UI
function move(move_data){
    socket.emit('move', move_data)
}
function new_game(){
    socket.emit('new_game')
}

// server is asserting piece locations
socket.on('update_pieces', (pieces_arr) => {
    update_pieces(pieces_arr)
})

// server is asserting board state
socket.on('update_board', (board_arr) => {
    update_board(board_arr)
})




