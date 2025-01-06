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

const KING_TOKEN = 'K'
const ATT_TOKEN = 'A'
const DEF_TOKEN = 'D'

const HOME_SQUARE = 'H'
const GOAL_SQUARE = 'G'

const game_states = new Map();

function new_game(){
    const game_id = generate_unique_id()
    const board_arr = state.new_board()
    const pieces_arr = state.new_pieces()
    const player_side = 'defenders'
    const game_state = {'board_arr':board_arr, 'pieces_arr':pieces_arr, 'player_side':player_side}

    game_states.set(game_id, game_state)
    return game_id 
}

function new_board(){
    let board_state = Array.from({ length: 11 }, () => Array(11).fill(' '))
    tile_objectives.forEach(coor => {
        board_state[coor[0]][coor[1]] = GOAL_SQUARE
    })
    board_state[home[0]][home[1]] = HOME_SQUARE
    return board_state
}
 
function new_pieces(){
    let pieces_state = Array.from({ length: 11 }, () => Array(11).fill(' '))
    defender_start.forEach(coor => {
        pieces_state[coor[0]][coor[1]] = DEF_TOKEN
    })
    attacker_start.forEach(coor => {
        pieces_state[coor[0]][coor[1]] = ATT_TOKEN
    })
    pieces_state[king_start[0]][king_start[1]] = KING_TOKEN
    return pieces_state
}

function check_win(pieces_arr, board_arr){
    // Check piece array for piece counts and king location
    let king_coor = null; 
    let att_count = 0; 
    pieces_arr.forEach((row, i) => {
        array.forEach((c,j) =>{
            if(c == KING_TOKEN) {
                king_coor[0] = i
                king_coor[1] = j
            } else if(c == ATT_TOKEN) {
                att_count++
            }
        })
    })

    if(king_coor === null){         // king is dead
        return 'attackers'
    }
    if(att_count === 0){            // all attackers are dead
        return 'defenders'
    }
    if(board_arr[king_coor[0]][king_coor[1]] === GOAL_SQUARE){
        return 'defenders'          // king is on goal square
    }
}

function move_piece(pieces_arr, start, end){
    // pieces can only mode strictly vertical, or strictly horizontal
    if(start[0] !== end[0] && start[1] !== end[1]){
        return "invalid move direction"
    }
    // pieces cannot move through other pieces
    if(!validate_move_clear_spaces(pieces_arr, start, end)){
        return "invalid move, there is something in the way"
    }

    // move is valid, move piece at start location to end location
    let piece = pieces_arr[start[0]][start[1]]
    pieces_arr[end[0]][end[1]] = piece
    pieces_arr[start[0]][start[1]] = EMPTY_SPACE

    check_captures(pieces_arr, end, piece)
    return ''
}

function validate_move_clear_spaces(pieces_arr, start, end){
    let max,min,con,dir
    if(start[0] === end[0]){
        max = Math.max(start[1], end[1])
        min = Math.min(start[1], end[1])
        if(max === start[1]){max--} // leave out the starting space (counting self)
        else                {min++}
        con = start[0] // constant
        dir = true
    } else {
        max = Math.max(start[0], end[0])
        min = Math.min(start[0], end[0])
        if(max === start[0]){max--} // leave out the starting space (counting self)
        else                {min++}
        con = start[1] // constant
        dir = false
    }
    for(let i=min; i<=max; i++){
        let inspect_space = pieces_arr[dir?con:i][dir?i:con]
        if(inspect_space !== EMPTY_SPACE){
            return false
        }
    }
    return true
    // believe it or not, this is cleaner than when I originally wrote it... 
}

function check_captures(pieces_arr, check_coor, piece){
    let check_1,check_2

    function check_capture(pieces_arr, check_coor, piece, i, j){
        let target_coor = [check_coor[0]+i,check_coor[1]+j]
        check_1 = check_tile(pieces_arr, target_coor)
        check_2 = check_tile(pieces_arr, [check_coor[0]+i+i,check_coor[1]+j+j])
        
        if(check_1 !== null && check_1 !== piece && 
            check_2 !== null && check_2 === piece){
                kill_piece(pieces_arr, target_coor)
            }
    }
    check_capture(pieces_arr, check_coor, piece, i=1, j=0)
    check_capture(pieces_arr, check_coor, piece, i=-1,j=0)
    check_capture(pieces_arr, check_coor, piece, i=0, j=1)
    check_capture(pieces_arr, check_coor, piece, i=0, j=-1)
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
function kill_piece(pieces_arr, piece_coor){
    pieces_arr[piece_coor[0]][piece_coor[1]] = EMPTY_SPACE
}

// TODO I should be able to put pieces arr, boar arr, and player side into a game state object. 
// cleaner that way
function server_move(pieces_arr, board_arr, start, end, player_side){
    console.log(`server move player_side: ${player_side}`)
    let piece = pieces_arr[start[0]][start[1]]
    if((player_side == 'attackers' && piece != ATT_TOKEN) ||
            (player_side == 'defenders' && (piece !== DEF_TOKEN && piece !== KING_TOKEN))
        ){
        let response = {
            "player_message": `It is the ${player_side}'s turn. `,
            "pieces_state": pieces_state,
            "opponent_message": ""
        }
        return response
    }

    let move_res = move_piece(pieces_arr, start, end)
    if(move_res !== ''){
        let response = {
            "player_message": move_res,
            "pieces_arr": pieces_arr,
            "opponent_message": ""
        }
        return response
    }
    let winner = check_win(pieces_arr, board_arr)
    if(winner != ''){
        let response = {
            "player_message": `${winner} won!`,
            "pieces_arr": pieces_arr,
            "opponent_message": `${winner} won!`
        }
        return response
    }

    let response = {
        "player_message": `${winner} won!`,
        "pieces_arr": pieces_arr,
        "opponent_message": `${winner} won!`
    }
    return response
}

// function debug_print_state(state){
//     state.forEach((row) =>{
//     row.forEach((element) =>{
//         process.stdout.write(element)
//     })
//     process.stdout.write('\n')
//     })
// }

module.exports = {
    new_board, 
    new_pieces,
    move_piece,
    server_move
}