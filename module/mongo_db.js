require('dotenv').config()

const { MongoDBOperations } = require('../services/db/mongo/mongo-operation')

async function insertMongo(detail) {
    let mongo_operations = new MongoDBOperations(detail.entity);
    delete detail.entity
    let ans = await mongo_operations.insertOne(detail)
    return ans.insertedId
}
async function readMongo(entity, filter = {}, project = {}) {
    let mongo_operations = new MongoDBOperations(entity);
    let ans = await mongo_operations.findMany(filter, project);
    return ans
}
async function updateMongo(entity, filter = {}, update = {}, options = {}) {
    let mongo_operations = new MongoDBOperations(entity);
    let ans = await mongo_operations.updateMany(filter, update, options)
    return ans
}
async function deleteMongo(entity, filter = {}) {
    let mongo_operations = new MongoDBOperations(entity);
    let ans = await mongo_operations.deleteMany(filter)
    return ans
}

module.exports = { insertMongo, readMongo, updateMongo, deleteMongo }