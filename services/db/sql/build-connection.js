const { connectSQL } = require("./sql-connection");

const db = ['Bubble','RapidMed']

const buildConnection = async () => {
    for (let index = 0; index < db.length; index++) {
        await connectSQL(db[index])
    }
}

module.exports = { buildConnection ,db}