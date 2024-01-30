const { update, sqlTransaction } = require('../services/db/sql/sql-operation')
const { DBTypes } = require('../utils/types')
const { removeIdentityDataFromObject, buildUpdateQuery, buildInsertQuery } = require('./config/config.sql')
const { getEntityConfigData, isSimpleEntity, getSqlColumnsUpdateCopy, simplifiedObject, disableItem, updateTheChanges, addItem } = require('./config/config')
const { compareObject, splitComplicatedObject } = require('./config/config.objects')
const { startReadOne } = require('./read')
const { removeKeysFromObject } = require('../utils/code/objects')
const { convertToOneLevelArray } = require('../utils/code/functions')




async function startupdate({ project, entityName, data, condition }) {
    try {
        const { entity, type } = getEntityConfigData({ project, entityName })
        if (type === DBTypes.SQL) {
            const isSimple = isSimpleEntity(project, entityName)
            if (isSimple) {
                if (Array.isArray(data)) {

                }
                else {
                    const difference = await compareObject(entity.dbName, entity, data, condition)
                    if (difference !== true) {
                        const create = difference.update.some(key => key.update === 'create')
                        if (create) {
                            let updateItem = await startReadOne({ project, entityName, condition: difference.condition })
                            updateItem = disableItem({ item: updateItem, reason: 'update data', entity })
                            let newItem = { ...removeIdentityDataFromObject(entity, updateItem) }
                            const removeProps = getSqlColumnsUpdateCopy(entity)
                            newItem = removeKeysFromObject(newItem, removeProps)
                            const queries = [
                                buildUpdateQuery(entity, updateItem),
                                buildInsertQuery(entity, newItem)
                            ]
                            const result = sqlTransaction(queries)
                            return result
                        }
                        else {
                            const response = await updateSimpleObject({ entity, data, condition })
                            if (response.rowsAffected === 1)
                                return true
                            else
                                return false
                        }
                    }
                }
            }
            else {
                const splitObject = splitComplicatedObject(project, data, entityName)
                const updateEntities = splitObject.map(obj => ({ entity: getEntityConfigData({ project, entityName: obj.entityName }).entity, value: obj.value }))
                let updatesData = await Promise.all(updateEntities.map(async obj => {
                    let data = obj.value
                    if (Array.isArray(data) === false) {
                        data = [data]
                    }
                    let result = await Promise.all(data.map(async item => await compareObject(obj.entity.dbName, obj.entity, item)))
                    result = result.filter(item => item !== true)
                    return result
                }))
                updatesData = convertToOneLevelArray(updatesData)
                updatesData = updatesData.filter(item=>item!=false)
                const updateObjects = updatesData.filter(({ updates }) => updates.every(item => item.update === undefined))
                const createObjects = updatesData.filter(({ updates }) => updates.some(item => item.update === "create"))
                const createNewObjects = updatesData.filter(({ updates }) => updates.some(item => item.update === "createnew"))
                let queries = []
                if (updateObjects.length > 0) {
                    updateObjects.forEach(up => {
                        up.updates = up.updates.reduce((obj, { key, newVal }) => {
                            obj[key] = newVal
                            return obj
                        }, {})
                        // console.log(up.updates)
                    })
                    queries = [updateObjects.map(({ entity, updates, condition }) => buildUpdateQuery(entity, updates, condition))]
                }
                if (createObjects.length > 0) {

                    queries = [...queries, await Promise.all(createObjects.map(async cr => {
                        let updateItem = await startReadOne({ project, entityName: cr.entity.MTDTable.entityName.name, condition: cr.condition })
                        let simpleItem = simplifiedObject({ project, entity, object: updateItem })
                        const { item, condition } = disableItem({ item: simpleItem, reason: 'update data', entity: cr.entity })
                        let newItem = { ...removeIdentityDataFromObject(cr.entity, simpleItem) }
                        newItem = updateTheChanges(newItem, cr.updates)
                        const removeProps = getSqlColumnsUpdateCopy(cr.entity)
                        newItem = removeKeysFromObject(newItem, removeProps)
                        newItem = addItem({ item: newItem })
                        return [
                            buildUpdateQuery(cr.entity, item, condition),
                            buildInsertQuery(cr.entity, newItem)
                        ]

                    }))]
                }
                if(createNewObjects.length>0){
                    createNewObjects.forEach(up => {
                        up.values = up.updates.reduce((obj, { key, newVal }) => {
                            obj[key] = newVal
                            return obj
                        }, {})
                    })
                    queries = [createNewObjects.map(({ entity, values }) => buildInsertQuery(entity, {...addItem({item:values})}))]
                    console.log({queries});
                }
                queries = convertToOneLevelArray(queries)
                const result = await sqlTransaction(queries)
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

async function updateSimpleObject({ entity, data, condition }) {
    try {

        const query = buildUpdateQuery(entity, data, condition)
        let ans = await update(query)
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
        // condition = buildSqlCondition(entity, condition)
        // set = removeIdentityDataFromObject(entity, data)
        // const alias = getTableAlias(entity)
        // const tablename = getTableName(entity)
        // const sqlObject = parseObjectValuesToSQLTypeObject(data, entity.columns)
        // const entries = Object.entries(sqlObject).map(e => ({ key: e[0], value: e[1] }))
        // const updateValues = entries.map(({ key, value }) => `${alias}.${key} = ${value}`).join(',')
        // let ans = await update(type, { tablename, alias }, updateValues, condition)
        // if (ans) {
        //     return ans
        // }
        // return false
    }
    catch (error) {
        throw error;
    }
}

async function updateOneMongo() { }
async function updateManyMongo() { }

module.exports = { updateManySql, updateOneMongo, updateManyMongo, startupdate, updateSimpleObject }
