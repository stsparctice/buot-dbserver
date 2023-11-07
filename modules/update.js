const { update, sqlTransaction, read } = require('../services/db/sql/sql-operation')
const { DBTypes } = require('../utils/types')
const { buildSqlCondition, removeIdentityDataFromObject, getTableName, getTableAlias, parseObjectValuesToSQLTypeObject } = require('./config/config.sql')
// const { DBTypes, buildSqlCondition } = require('./config/config')
const { getEntityConfigData, isSimpleEntity, getEntityFromConfig } = require('./config/config')
const { compareObject, splitComplicatedObject } = require('./config/config.objects')




async function startupdate({ project, entityName, data, condition }) {
    try {
        const { entity, type } = getEntityConfigData({ project, entityName })
        if (type === DBTypes.SQL) {
            const isSimple = isSimpleEntity(project, entityName)
            if (isSimple) {
                const response = await updateSimpleObject({ type: entity.dbName, entity, data, condition })
                if (response.rowsAffected === 1)
                    return true
                else
                    return false
            }
            else {
                const splitObject = splitComplicatedObject(data, entityName)
                console.log({ splitObject })
                const updateEntities = splitObject.map(obj => ({ entity: getEntityConfigData({ project, entityName: obj.entityName }).entity, value: obj.value }))
                let updatesData = await Promise.all(updateEntities.map(async obj => {
                    let data = obj.value
                    if (Array.isArray(data) === false) {
                        data = [data]
                    }
                    let result = await Promise.all(data.map(async item => await compareObject(entity.dbName, obj.entity, item)))
                    result = result.filter(({ updates }) => updates.length > 0)

                    return result
                }))
                updatesData = updatesData.filter(item => item.length > 0)
                updatesData = updatesData.reduce((list, up) => list = [...list, ...up], [])
                console.log(updatesData)
                const result = await sqlTransaction(updatesData)
                return result

            }

            // const items = await updateManySql({ type: entity.dbName, entity, data, condition })
            // return items
        }
    }
    catch (error) {
        console.log({ error })
        throw error
    }

}

async function updateSimpleObject({ type, entity, data, condition }) {
    try {
        condition = buildSqlCondition(entity, condition)
        set = removeIdentityDataFromObject(entity, data)
        const alias = getTableAlias(entity)
        const tablename = getTableName(entity)
        const sqlObject = parseObjectValuesToSQLTypeObject(set, entity.columns)
        const entries = Object.entries(sqlObject).map(e => ({ key: e[0], value: e[1] }))
        const updateValues = entries.map(({ key, value }) => `${alias}.${key} = ${value}`).join(',')
        let ans = await update(type, { tablename, alias }, updateValues, condition)
        console.log({ ans })
        if (ans) {
            return ans
        }
        return false
    }
    catch (error) {
        throw error;
    }
}

async function updateManySql({ type, entity, data, condition }) {
    try {
        condition = buildSqlCondition(entity, condition)
        set = removeIdentityDataFromObject(entity, data)
        const alias = getTableAlias(entity)
        const tablename = getTableName(entity)
        const sqlObject = parseObjectValuesToSQLTypeObject(data, entity.columns)
        const entries = Object.entries(sqlObject).map(e => ({ key: e[0], value: e[1] }))
        const updateValues = entries.map(({ key, value }) => `${alias}.${key} = ${value}`).join(',')
        let ans = await update(type, { tablename, alias }, updateValues, condition)
        if (ans) {
            return ans
        }
        return false
    }
    catch (error) {
        throw error;
    }
}

async function updateOneMongo() { }
async function updateManyMongo() { }

module.exports = { updateManySql, updateOneMongo, updateManyMongo, startupdate, updateSimpleObject }
