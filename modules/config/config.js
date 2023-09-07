require('dotenv');
const fs = require('fs');
const { DBTypes } = require('../../utils/types')
const { getDBConfig } = require('./project.config')


function readConfigFile(configUrl) {
    console.log({ configUrl })
    const response = fs.readFileSync(configUrl)
    return JSON.parse(response)
}

function getEntitiesFromConfig(configUrl) {
    const config = readConfigFile(configUrl)
    let sql = config.filter(({ db }) => db.some(({ type }) => type == DBTypes.SQL))
    let mongo = config.filter(db => db.db.type == DBTypes.MONGODB)
    return { sql, mongo }
}

function getEntityConfigData({ project, entityName }) {
    const configUrl = getDBConfig(project)
    let entity = getEntityFromConfig(configUrl, entityName)
    return entity
}

function getEntityFromConfig(configUrl, entityName) {
    const { sql, mongo } = getEntitiesFromConfig(configUrl)
    if (sql.length > 0) {
        const mapCollection = sql.map(({ dbName, db }) =>  db.map(({collections})=>collections.map(c => ({ dbName, ...c }))))
        const entityList = mapCollection.reduce((list, col)=>list=[...list, ...col.reduce((l, c)=>l=[...l, ...c], [])], [])
        console.log("!!!!!!!!!!!",entityName);
        const tables = entityList.filter(c => c.MTDTable.entityName.name === entityName)
        let existEntity = tables.some(t => t.MTDTable.entityName.name === entityName)
        if (existEntity) {
            let entityDB = tables.find(t => t.MTDTable.entityName.name === entityName)
            return { entity: entityDB, type: DBTypes.SQL }
        }
    }
    return undefined

}




module.exports = {
    readConfigFile,
    getEntitiesFromConfig,
    getEntityFromConfig,
    getEntityConfigData,
}