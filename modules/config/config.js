require('dotenv');
const fs = require('fs');
const { DBTypes } = require('../../utils/types')
const { getDBConfig } = require('./project.config');


function readConfigFile(configUrl) {
    const response = fs.readFileSync(configUrl)
    return JSON.parse(response)
}

function getEntitiesFromConfig(configUrl) {
    const config = readConfigFile(configUrl)
    const sql = config.filter(({ db }) => db.some(({ type }) => type == DBTypes.SQL))
    const mongo = config.filter(db => db.db.type == DBTypes.MONGODB)
    return { sql, mongo }
}

function getSqlDBWithTablesfromConfig(projectUrl) {
    const response = getDBConfig(projectUrl)
    const config = getEntitiesFromConfig(response)
    const { sql } = config
    const databases = sql.map(({ dbName, db }) => ({ dbName, db: db.map(({ collections }) => (collections.map(({ MTDTable, columns }) => ({ tablename: MTDTable.entityName.sqlName, columns })))) }))
    return databases
}

function getEntityConfigData({project, entityName }) {
    const configUrl = getDBConfig(project)
    let entity = getEntityFromConfig(configUrl, entityName)
    return entity
}


function getEntityFromConfig(configUrl, entityName) {
    console.log({entityName})
    const { sql, mongo } = getEntitiesFromConfig(configUrl)
    if (sql.length > 0) {
        const mapCollection = sql.map(({ dbName, db }) => db.map(({ collections }) => collections.map(c => ({ dbName, ...c }))))
        const entityList = mapCollection.reduce((list, col) => list = [...list, ...col.reduce((l, c) => l = [...l, ...c], [])], [])
        const tables = entityList.filter(c => c.MTDTable.entityName.name === entityName || c.MTDTable.entityName.sqlName === entityName)
        if (tables.length > 0) {
            let entityDB = tables.find(t => t.MTDTable.entityName.name === entityName || t.MTDTable.entityName.sqlName === entityName)
            return { entity: entityDB, type: DBTypes.SQL }
        }
    }
    return undefined

}

function isSimpleEntity(project, entityName) {
    const configUrl = getDBConfig(project)
    const { entity } = getEntityFromConfig(configUrl, entityName)
    const foreignKeys = entity.columns.filter(({ foreignkey }) => foreignkey)
    return foreignKeys.length === 0

}

function getForeignkeyBetweenEntities( entity, subentity) {
    console.log(entity.type, subentity.type)
    if (entity.type === DBTypes.SQL && subentity.type === DBTypes.SQL) {
        const foreignKeys = subentity.entity.columns.filter(({ foreignkey }) => foreignkey)
        const key = foreignKeys.find(({ foreignkey }) => foreignkey.ref_table === entity.entity.MTDTable.entityName.sqlName)
        return key
    }
    return undefined
}




module.exports = {
    readConfigFile,
    getEntitiesFromConfig,
    getEntityFromConfig,
    getEntityConfigData,
    getSqlDBWithTablesfromConfig,
    getForeignkeyBetweenEntities,
    isSimpleEntity
}