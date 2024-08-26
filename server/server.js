const express = require('express')
const path = require('path')
// const io = require('socket.io')(80)

const state = require('./state.js')

const app = express()
const PORT = process.env.PORT || 3000

// middleware 
app.use(express.json()) // for JSON bodies
app.use(express.urlencoded({ extended: true })) // url encoded bodies
app.use(express.static(path.join(__dirname, '../client'))) // serve static files

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

// routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
  
app.get('/new_game', (req, res) => {
    const data = {
        board_state: state.new_board(),
        pieces_state: state.new_pieces() 
    }
    res.json(data)
})