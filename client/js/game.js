import { create_board, populate_board } from './ui.js';

fetch('/new_game', {
    method: 'GET'
})
.then(response => {
    if(!response.ok){
        throw new Error('Network response was not ok. ');
    }
    return response.json();
})
.then(data => {
    create_board(data.board_state)
    populate_board(data.pieces_state)
})

console.log('end of script. ')



