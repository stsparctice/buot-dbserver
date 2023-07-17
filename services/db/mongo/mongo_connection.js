require('dotenv').config()
const { MongoClient } = require('mongodb')
const { MONGO_CONNECTION } = process.env
let client = null

const connect = async (server_url = MONGO_CONNECTION) => {
    if (server_url.trim().indexOf('mongodb') != 0) {
        throw new Error('connection string not in the rigth format.')
    }
    client = new MongoClient(server_url.trim())
     
    await client.connect()
}

const disconnect = async () => {
    if (client == null) {
        throw new Error('client is still null')
    }
    await client.close()
}

const getClient = () => client

module.exports = { connect, disconnect, getClient }
