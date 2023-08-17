require('dotenv').config()
const { getClient } = require('./mongo_connection')

const { MONGO_DB, COLLECTION_NAME } = process.env

class MongoDBOperations {
    constructor(entityName, dbName = MONGO_DB) {
        this.collectionName = entityName
        this.dbName = dbName
    }
    async insertOne(obj) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).insertOne(obj)
        return result
    }
    async insertMany(obj) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).insertMany(obj)
        return result.insertedId
    }
    async findOne(filter = {}, project = {}) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).findOne(filter, { projection: project })
        return result
    }
    async findMany(filter = {}, project = {}) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).find(filter, { projection: project }).toArray();
        return result;
    }
    async updateOne(condition = {}, update = {}) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).updateOne(condition, { $set: update })
        return result
    }
    async updateMany(filter = {}, update = {}, options = {}) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).updateMany(filter, update, options)
        return result;
    }
    async deleteMany(filter = {}) {
        const result = await getClient().db(this.dbName).collection(this.collectionName).deleteMany(filter)
        return result
    }

}

module.exports = { MongoDBOperations }
