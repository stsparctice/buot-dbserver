const { connectSQL } = require("./sql-connection");


const buildConnection = async () => {
    for (let index = 0; index < db.length; index++) {
        await connectSQL(db[index])
    }
}

module.exports = { buildConnection }