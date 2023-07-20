const data = require('../data/newConfig.json')
const { getEntityFromConfig } = require('./config/config')
const { getDBConfig } = require('./config/project.config')

function getEntityConfigData({ project, entityName }) {
    const configUrl = getDBConfig(project)
    console.log({ configUrl })
    const config = getEntityFromConfig(entityName, configUrl)
    let entity = findCollection(config, entityName)
    return entity
}


function createArrColumns(arr) {
    let arrColumns = []
    let s
    for (let i = 0; i < arr.length; i++) {
        s = `[${arr[i]}]`
        arrColumns.push(s)
    }
    return arrColumns
}

function createArrValues(arr) {
    let arrColumns = []
    let s
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].includes('/'))
            arrColumns.push(arr[i])
        else {
            s = `'${arr[i]}'`
            arrColumns.push(s)
        }
    }
    return arrColumns
}

function findCollection(config, collectionName) {
    let type
    for (let i = 0; i < config.length; i++) {

        for (let j = 0; j < config[i].db.length; j++) {

            type = config[i].db[j].type
            let find = config[i].db[j].collections.find(col =>
                (col.MTDTable.collectionName.name == collectionName)
            )

            if (find != undefined) {
                find = find.MTDTable
                find.dbName = config[i].dbName
                find.type = type
                return find
            }
        }
    }
}

module.exports = { createArrColumns, createArrValues, findCollection, getEntityConfigData }
