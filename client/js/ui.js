// ui.js
// contains all the machinery to create and populate the client ui based 
// on server information. 
// - making the board based on server board state
// - making the pieces based on server piece state
// - make pieces interactable on client's side
// - display messages from server

import {move} from './logic.js'

console.log('connected to script... ')

let game_board = document.getElementById('gameboard')
let player_msg = document.getElementById('player_message_box')
let opponent_msg = document.getElementById('opponent_message_box')

let being_dragged
let player_side

game_board.addEventListener('dragover', event => {
    // allows item to be dropped later
    event.preventDefault()
})
game_board.addEventListener('drop', event => {
    event.preventDefault()
    player_msg.textContent = ''

    // only drop pieces on tiles
    if(!event.target.matches('.tile')){return}

    // get coors of start and end
    let start_coor = being_dragged.parentElement.id.match(/\d+/g).map(Number)
    let end_coor = event.target.id.match(/\d+/g).map(Number)
    let player_side = being_dragged.matches(".attacker")? "attacker": "defender"
    console.log(`DEBUG: being dragged side: ${player_side}`)

    let data = {
        piece_start : start_coor,
        piece_end   : end_coor,
        player_side : player_side
    }
    move(data);
})

export function update_board(board_arr){
    // reset gameboard with no pieces
    game_board.innerHTML = ""
    for(let j = 0; j <= 10; j++){
        for(let i = 0; i <= 10; i++){
            let tile = document.createElement('div')
            tile.classList.add('tile')
            tile.setAttribute("id", `tile_${i}_${j}`)
            tile.setAttribute("id", `tile_${i}_${j}`)

            if(board_arr[i][j] === 'o'){
                tile.classList.add('tile_objective')
            } else if(board_arr[i][j] === 'h'){
                tile.classList.add('tile_home')
            }
            game_board.appendChild(tile)
        }
    }
}

export function update_pieces(piece_arr){
    piece_arr.forEach((column, i) => {
        column.forEach((square, j) => {
            let tile = document.getElementById(`tile_${i}_${j}`)
            tile.innerHTML = ""
            if(square === ' '){return}

            let piece = document.createElement('div')
            piece.classList.add('piece')
            piece.classList.add(square==='a'?'attacker':'defender')
            piece.setAttribute('draggable', true)
            piece.addEventListener('dragstart', event => {
                being_dragged = event.target
            })
            piece.addEventListener('dragend', () => {
                being_dragged = null
            })

            tile.appendChild(piece)
        })
    })

}

function declare_winner(winner){
    const win_msg = 'You are the winner!!'
    const loss_msg = 'You lost.'

    player_msg.textContent =   winner === player_side? win_msg:loss_msg //TODO: remove these on new game
    player_msg.classList.add(  winner === player_side? 'winner':'loser')
    opponent_msg.textContent = winner !== player_side? win_msg:loss_msg
    opponent_msg.classList.add(winner !== player_side? 'winner':'loser')
}

function display_message(msg){
    document.getElementById('message_box').textContent = msg
}
