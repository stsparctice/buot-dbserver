require('dotenv');
const fs = require('fs');
const { DBTypes, sqlKeyTypes } = require('../../utils/types')
const { getDBConfig } = require('./project.config');


function readConfigFile(configUrl) {
    const response = fs.readFileSync(configUrl)
    return JSON.parse(response)
}

function getTableAlias(entity) {
    if (entity === undefined) {
        throw 'entity is a required argument'
    }
    return entity.MTDTable.entityName.name
}

function getTableName(entity) {
    if (entity === undefined) {
        throw 'entity is a required argument'
    }
    return entity.MTDTable.entityName.sqlName
}

function getTableColumns(entity, columns = []) {
    try {
        let cols
        if (columns.length != 0) {
            cols = entity.columns.filter(col => columns.includes(col.name)).map(({ name, sqlName, type }) => ({ name, sqlName, type: type.type }))
        }
        else {
            if (entity.columns == undefined)
                cols = entity.entity.columns.map(({ name, sqlName, type }) => ({ name, sqlName, type: type.type }))
            else
                cols = entity.columns.map(({ name, sqlName, type }) => ({ name, sqlName, type: type.type }))

        }

        return cols
    }
    catch (error) {
        throw error
    }
}

function getPrimaryKeyField(entity) {
    console.log({entity});
    let col = entity.columns.find(col => (col.primarykey === true))
    if (col) {
        return { name: col.name, sqlName: col.sqlName }
    }
    return undefined
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

function getEntityConfigData({ project = 'wl', entityName }) {
    const configUrl = getDBConfig(project)
    let entity = getEntityFromConfig(configUrl, entityName)
    return entity
}


function getEntityFromConfig(configUrl, entityName) {
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
    const { sql } = getEntitiesFromConfig(configUrl)
    if (sql.length > 0) {
        const mapCollection = sql.map(({ dbName, db }) => db.map(({ collections }) => collections.map(c => ({ dbName, ...c }))))
        const entityList = mapCollection.reduce((list, col) => list = [...list, ...col.reduce((l, c) => l = [...l, ...c], [])], [])
        const foreignKeys = entityList.filter(({ columns }) => {
            const fk = columns.filter(({ foreignkey }) => foreignkey && foreignkey.ref_table === entity.MTDTable.entityName.sqlName)
            return fk.length > 0
        })
        console.log({foreignKeys});
        return foreignKeys.length === 0
    }

}

function getSqlColumnsUpdateCopy(entity, update = false) {
    const selectedColumns = entity.columns.filter(({ update_copy }) => update_copy === update)
    const result = selectedColumns.map(({ name }) => name)
    return result
}

function getForeignkeyBetweenEntities(entity, subentity) {
    console.log(entity.type, subentity.type)
    if (entity.type === DBTypes.SQL && subentity.type === DBTypes.SQL) {
        const foreignKeys = subentity.entity.columns.filter(({ foreignkey }) => foreignkey)
        const key = foreignKeys.find(({ foreignkey }) => foreignkey.ref_table === entity.entity.MTDTable.entityName.sqlName)
        key.foreignkey.ref_column_name = entity.entity.columns.find(({ sqlName})=>sqlName===key.foreignkey.ref_column).name
        return key
    }
    return undefined
}

function simplifiedObject({ project, entity, object }, func = getEntityConfigData) {
    const keys = Object.keys(object)
    const simple = keys.reduce((obj, key) => {
        const column = entity.columns.find(({ name }) => name === key)
        if (column.foreignkey) {
            const { ref_column } = column.foreignkey
            const subEntity = func({ project, entityName: object[key].entity })
            const columnSqlName = subEntity.entity.columns.find(({ sqlName }) => sqlName === ref_column)
            obj[key] = object[key][columnSqlName.name]
        }
        else {
            obj[key] = object[key]
        }
        return obj
    }, {})

    return simple
}

function disableItem({item, reason, user = 'develop', entity},  getPrimaryKeyFielsMethod = getPrimaryKeyField) {
    const  pk  = getPrimaryKeyFielsMethod(entity)
    const condition = {}
    condition[pk.name]= item[pk.name]
    item = { disableReason: reason, disableUser: user, disabled: 1, disabledDate: new Date() }
    return {item, condition}
}

function updateTheChanges(item, updates){
    console.log(updates)
    updates.forEach(({key, newVal}) => {
        console.log({key, newVal})
        item[key] = newVal
    });
    return item
}

function addItem({item, userName='develop'}){
    return {...item, addedDate:new Date(), userName, disabled:false}
}




module.exports = {
    readConfigFile,
    getEntitiesFromConfig,
    getEntityFromConfig,
    getEntityConfigData,
    getTableAlias,
    getTableName,
    getPrimaryKeyField,
    getSqlColumnsUpdateCopy,
    getTableColumns,
    getSqlDBWithTablesfromConfig,
    getForeignkeyBetweenEntities,
    isSimpleEntity,
    simplifiedObject,
    disableItem,
    updateTheChanges,
    addItem
}