let game_board = document.getElementById('gameboard')
const tile_objectives = [
    [1,1],[1,11],
    [11,1],[11,11]
]
const attacker_start = [
    [1,4],[1,5],[1,6],[1,7],[1,8],
    [2,6],
    [4,1],[5,1],[6,1],[7,1],[8,1],
    [6,2],
    [11,4],[11,5],[11,6],[11,7],[11,8],
    [10,6],
    [4,11],[5,11],[6,11],[7,11],[8,11],
    [6,10]
]
const defender_start = [
    [4,6],
    [5,5],[5,6],[5,7],
    [6,4],[6,5],     ,[6,7],[6,8],
    [7,5],[7,6],[7,7],
    [8,6]
]
const king_start = [11,10]
const home = [6,6]

let defenders_pieces
let attackers_pieces
let being_dragged

new_game()

game_board.addEventListener('dragover', event => {
    // allows item to be dropped later
    event.preventDefault()
})
game_board.addEventListener('drop', event => {
    event.preventDefault()

    if(!event.target.matches('.tile')){return}
    let start_coor = being_dragged.parentElement.id.match(/\d+/g).map(Number)
    let end_coor = event.target.id.match(/\d+/g).map(Number)
    if(!validate_move_direction(start_coor, end_coor)){return}
    if(!valid_move_clear_spaces(start_coor, end_coor)){return}
    event.target.appendChild(being_dragged)
    check_captures(end_coor, being_dragged.matches('.attacker'))
    check_win()
})

function new_game(){
    game_board.innerHTML = ""

    // make gameboard with no features or pieces
    for(let j = 1; j <= 11; j++){
        for(let i = 1; i <= 11; i++){
            let tile = document.createElement('div')
            tile.classList.add('tile')
            tile.setAttribute("id", `tile_${i}_${j}`)
            game_board.appendChild(tile)
        }
    }

    // populate special tiles
    tile_objectives.forEach(element => {
        let i = element[0]
        let j = element[1]
        let tile = document.getElementById(`tile_${i}_${j}`)
        if(tile){
            tile.classList.add("tile_objective")
        }
    })
    let home_tile = document.getElementById(`tile_${home[0]}_${home[1]}`)
    if(home_tile){
        home_tile.classList.add("tile_home")
    }
    
    // populate pieces
    defenders_pieces = 0
    attackers_pieces = 0
    function add_piece(element, is_defender){
        const i = element[0]
        const j = element[1]
        const tile = document.getElementById(`tile_${i}_${j}`)
        if(tile){
            const piece = document.createElement('div')
            piece.classList.add(`piece`)
            piece.classList.add(is_defender ? `defender` : `attacker`)
            piece.setAttribute('draggable', true)
            piece.addEventListener('dragstart', event => {
                being_dragged = event.target
            })
            piece.addEventListener('dragend', () => {
                being_dragged = null
            })
            tile.appendChild(piece)
            if(is_defender){
                defenders_pieces++
            } else {
                attackers_pieces++
            }
            return piece
        } else {
            console.error(`bad tile id: tile_${i}_${j}`)
            return null
        }
    }
    defender_start.forEach(element => add_piece(element, true))
    attacker_start.forEach(element => add_piece(element, false))
    let king = add_piece(king_start, true)
    king.setAttribute('id', 'king')
}

function check_win(){
    let king_tile = document.getElementById('king').parentElement
    let tile_coor = get_tile_coor(king_tile)
    tile_objectives.forEach(element => {
        if(tile_coor[0] === element[0] && tile_coor[1] === element[1]){
            return 'defenders win!'
        }
    })
    if(defenders_pieces === 0){return 'attackers win!'}
    if(attackers_pieces === 0){return 'defenders win!'}
    return ""
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
function validate_move_direction(start, end){
    return start[0] == end[0] || start[1] == end[1]
}
function valid_move_clear_spaces(start, end){
    let max,min,con,dir
    if(start[0] == end[0]){
        max = Math.max(start[1], end[1])
        min = Math.min(start[1], end[1])
        con = start[0]
        dir = true
    } else {
        max = Math.max(start[0], end[0])
        min = Math.min(start[0], end[0])
        con = start[1]
        dir = false
    }
    for(let i=min; i<=max; i++){
        let inspect_tile = document.getElementById(`tile_${dir?con:i}_${dir?i:con}`)
        if(inspect_tile.children.length !== 0 && inspect_tile.children[0] !== being_dragged)
            return false
    }
    return true
}
function check_captures(check_coor, attackers=true){
    let check_1,check_2

    function check_capture(check_coor, attackers, i, j){
        let target_coor = [check_coor[0]+i,check_coor[1]+j]
        check_1 = check_tile(target_coor)
        check_2 = check_tile([check_coor[0]+i+i,check_coor[1]+j+j])
        
        if(check_1 !== null && check_1 !== attackers && 
            check_2 !== null && check_2 === attackers){
                kill_piece(target_coor)
            }
    }
    check_capture(check_coor, attackers, i=1, j=0)
    check_capture(check_coor, attackers, i=-1,j=0)
    check_capture(check_coor, attackers, i=0, j=1)
    check_capture(check_coor, attackers, i=0, j=-1)
}
function kill_piece(piece_coor){
    let doomed_piece = get_piece_from_tile_coor(piece_coor)
    if(doomed_piece.matches('.defender')){
        defenders_pieces--
    } else {
        attackers_pieces--
    }
    doomed_piece.remove()
}

function check_tile(tile_coor){
    // returns null if no children or out of bounds, 
    // returns true for attacking piece 
    // returns false for defending piece
    
    if(tile_coor[0] < 0 || tile_coor[0] > 11)
        return null
    if(tile_coor[1] < 0 || tile_coor[1] > 11)
        return null

    let children = document.getElementById(`tile_${tile_coor[0]}_${tile_coor[1]}`).children
    if(children.length === 0)
        return null

    // return true if tile has attacking piece
    if(children[0].matches(`.defender`))
        return false
    // return false if tile has defending piece
    if(children[0].matches(`.attacker`))
        return true

    // base case for any features later (powerup, obstacles, etc.)
    return null
}
function get_tile_coor(tile){
    let coor = tile.id.match(/\d+/g).map(Number)
    return coor
}
function get_piece_from_tile_coor(tile_coor){
    let children = document.getElementById(`tile_${tile_coor[0]}_${tile_coor[1]}`).children
    if(children.length === 1){
        return children[0]
    }
}

function display_message(msg){
    document.getElementById('message_box').textContent = msg
}



