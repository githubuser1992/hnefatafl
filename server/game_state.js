// handle game logic server-side
// - define board presets
// - define piece presets
// - allow/ disallow moves
// - test win/loss condtions

const tile_objectives = [
    [0,0],[0,10],
    [10,0],[10,10]
]
const attacker_start = [
    [0,3],[0,4],[0,5],[0,6],[0,7],
    [1,5],
    [3,0],[4,0],[5,0],[6,0],[7,0],
    [5,1],
    [10,3],[10,4],[10,5],[10,6],[10,7],
    [9,5],
    [3,10],[4,10],[5,10],[6,10],[7,10],
    [5,9]
]
const defender_start = [
    [3,5],
    [4,4],[4,5],[4,6],
    [5,3],[5,4],     ,[5,6],[5,7],
    [6,4],[6,5],[6,6],
    [7,5]
]
const king_start = [10,9]
const home = [5,5]

const EMPTY_SPACE = " "
const MIN_SPACE = 0
const MAX_SPACE = 10

let game_state
let pieces_state
let king_coor
let defenders_pieces
let attackers_pieces

let player_turn = "defender"

function new_board(){
    game_state = Array.from({ length: 11 }, () => Array(11).fill(' '))
    tile_objectives.forEach(coor => {
        game_state[coor[0]][coor[1]] = 'o'
    })
    game_state[home[0]][home[1]] = 'h'
    return game_state
}
 
function new_pieces(){
    pieces_state = Array.from({ length: 11 }, () => Array(11).fill(' '))
    defender_start.forEach(coor => {
        pieces_state[coor[0]][coor[1]] = 'd'
    })
    defenders_pieces = defender_start.length
    attacker_start.forEach(coor => {
        pieces_state[coor[0]][coor[1]] = 'a'
    })
    attackers_pieces = attacker_start.length
    pieces_state[king_start[0]][king_start[1]] = 'k'
    defenders_pieces++
    king_coor = king_start
    return pieces_state
}

function check_win(){
    tile_objectives.forEach(coor =>{
        if(coor[0] === king_coor[0] && coor[1] === king_coor[1]){return 'defenders'}
    })
    if(defenders_pieces === 0){return 'attackers'}
    if(attackers_pieces === 0){return 'defenders'}
    return ''
}
function move_piece(start, end){
    if(!(start[0] === end[0] || start[1] === end[1])){
        return "invalid move direction"
    }
    if(!validate_move_clear_spaces(start, end)){
        return "invalid move, there is something in the way"
    }
    let piece = pieces_state[start[0]][start[1]]
    pieces_state[end[0]][end[1]] = piece
    pieces_state[start[0]][start[1]] = EMPTY_SPACE

    check_captures(end, piece)
    return ''
}
function validate_move_clear_spaces(start, end){
    let max,min,con,dir
    if(start[0] === end[0]){
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
        let inspect_space = pieces_state[dir?con:i][dir?i:con]
        // console.log(`inspect_space: ${inspect_space}`)
        // console.log(`dir: ${dir}, i: ${i}, con: ${con}`)
        // console.log(`start: ${start}`)
        if(inspect_space !== EMPTY_SPACE && (  (dir?start[1]:start[0]) !== i  )){
            console.log(`Validate clear spaces has failed...`)
            return false
        }
    }
    return true
}
function check_captures(check_coor, piece){
    let check_1,check_2

    function check_capture(check_coor, piece, i, j){
        let target_coor = [check_coor[0]+i,check_coor[1]+j]
        check_1 = check_tile(target_coor)
        check_2 = check_tile([check_coor[0]+i+i,check_coor[1]+j+j])
        
        if(check_1 !== null && check_1 !== piece && 
            check_2 !== null && check_2 === piece){
                kill_piece(target_coor)
            }
    }
    check_capture(check_coor, piece, i=1, j=0)
    check_capture(check_coor, piece, i=-1,j=0)
    check_capture(check_coor, piece, i=0, j=1)
    check_capture(check_coor, piece, i=0, j=-1)
}
function check_tile(space_coor){
    // returns null if no children or out of bounds, 
    // returns piece for game pieces ('a' or 'd')
    
    if(space_coor[0] <= MIN_SPACE || space_coor[0] > MAX_SPACE)
        return null
    if(space_coor[1] <= MIN_SPACE || space_coor[1] > MAX_SPACE)
        return null

    // console.log(`space_coor: ${space_coor}`)
    // debug_print_state(pieces_state)
    let space = pieces_state[space_coor[0]][space_coor[1]]
    if(space === EMPTY_SPACE)
        return null

    if(space === 'd' || space === 'a')
        return space

    // base case for any features later (powerup, obstacles, etc.)
    return null
}
function kill_piece(piece_coor){
    let doomed_piece = pieces_state[piece_coor[0]][piece_coor[1]]
    if(doomed_piece === 'd'){
        defenders_pieces--
    } else if(doomed_piece === 'a'){
        attackers_pieces--
    } else {
        console.error(`cannot remove non-piece at ${piece_coor[0]}, ${piece_coor[1]}`)
        return
    }
    pieces_state[piece_coor[0]][piece_coor[1]] = EMPTY_SPACE
}

function server_move(start, end, player_side){
    console.log(`server move player_side: ${player_side}`)
    if(!check_turn(player_side)){
        let response = {
            "player_message": `It is the ${player_side}'s turn. `,
            "pieces_state": pieces_state,
            "opponent_message": ""
        }
        return response
    }
    let move_res = move_piece(start, end)
    if(move_res !== ''){
        let response = {
            "player_message": move_res,
            "pieces_state": pieces_state,
            "opponent_message": ""
        }
        return response
    }
    let winner = check_win()
    if(winner != ''){
        let response = {
            "player_message": `${winner} won!`,
            "pieces_state": pieces_state,
            "opponent_message": `${winner} won!`
        }
        return response
    }

    let response = {
        "player_message": `${winner} won!`,
        "pieces_state": pieces_state,
        "opponent_message": `${winner} won!`
    }
    return response
}

function check_turn(player_side){
    if(player_turn !== player_side){
        return false
    } else if(player_side == 'attacker'){
        player_turn = 'defender'
        return true
    } else {
        player_turn = 'attacker'
        return true
    }
}

function debug_print_state(state){
    state.forEach((row) =>{
    row.forEach((element) =>{
        process.stdout.write(element)
    })
    process.stdout.write('\n')
    })
}

module.exports = {
    new_board, 
    new_pieces,
    move_piece,
    server_move
}