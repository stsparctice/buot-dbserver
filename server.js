require('dotenv').config()
const http = require('http')
const { app } = require('./app')
const { connect } = require('./services/db/mongo/mongo_connection')
const { connectSQL } = require('./services/db/sql/sql-connection')
const { createTables } = require('./services/db/sql/sql-init')
const { HOST, PORT } = process.env
connect().then(_ => {
    console.log('connect to mongo');
    connectSQL().then(_ => {
        console.log('connect to sql');
        createTables().then(_ => {
            app.listen(PORT, HOST,  () => {
                console.log(`http://${HOST}:${PORT}`);
            });
        });
    })
})
const server = http.createServer(app) 