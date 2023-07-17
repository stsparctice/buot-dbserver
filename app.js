const express = require('express')
const app = express()
const cors=require('cors')

const data = require('./data/data.json')
const functions = require('./data/functions.json')

const create_db = require('./routers/create')
const delete_db = require('./routers/delete')
const read_db = require('./routers/read')
const update_db = require('./routers/update')

app.use(cors())
app.use('/create_db', create_db)
app.use('/delete_db', delete_db)
app.use('/read_db', read_db)
app.use('/update_db', update_db)

app.set('view engine', 'ejs')

app.get('/getFunctions', (req, res) => {
    res.render('functions', { functions })
})
app.get('/getData', (req, res) => {
    res.render('data', { data })
})

module.exports = { app }; 