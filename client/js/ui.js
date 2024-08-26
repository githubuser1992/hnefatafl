let game_board = document.getElementById('gameboard')

let being_dragged
let player_side

game_board.addEventListener('dragover', event => {
    // allows item to be dropped later
    event.preventDefault()
})
game_board.addEventListener('drop', event => {
    event.preventDefault()

    // only drop pieces on tiles
    if(!event.target.matches('.tile')){return}

    // get coors of start and end
    let start_coor = being_dragged.parentElement.id.match(/\d+/g).map(Number)
    let end_coor = event.target.id.match(/\d+/g).map(Number)

    let move_result = state.move_piece(start_coor, end_coor) 
    if(move_result === ''){
        event.target.appendChild(being_dragged)
        state.check_win()
    } else {
        display_message(move_result)
    }
})

export function create_board(board_arr){
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

export function populate_board(piece_arr){
    piece_arr.forEach((row, j) => {
        row.forEach((square, i) => {
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

            let tile = document.getElementById(`tile_${i}_${j}`)
            tile.appendChild(piece)
        })
    })

}

function declare_winner(winner){
    let player_msg = document.getElementById('player_message_box')
    let opponent_msg = document.getElementById('opponent_message_box')

    const win_msg = 'You are the winner!!'
    const loss_msg = 'You lost.'

    player_msg.textContent =   winner === player_side? win_msg:loss_msg
    player_msg.classList.add(  winner === player_side? 'winner':'loser')
    opponent_msg.textContent = winner !== player_side? win_msg:loss_msg
    opponent_msg.classList.add(winner !== player_side? 'winner':'loser')
}

function display_message(msg){
    document.getElementById('message_box').textContent = msg
}
