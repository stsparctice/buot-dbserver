const { create, createTransaction } = require('../services/db/sql/sql-operation')
const { getEntityConfigData, addItem } = require('./config/config')
const { getTableColumns, buildColumnsValuesPair, buildInsertQuery } = require('./config/config.sql')
const { DBTypes } = require('../utils/types')
const { removeKeysFromObject } = require('../utils/code/objects')

async function startCreate({ project, entityName, values }) {
    const isTransaction = Object.values(values).some(val => Array.isArray(val) || val instanceof Object)
    if (isTransaction) {
        try {
            const response = startTransaction({ project, entityName, value: values })
            return response
        }
        catch (error) {
            throw error
        }
    }
    else {
        try {
            console.log(values, entityName)
            const entity = getEntityConfigData({ project, entityName })
            if (entity.type === DBTypes.SQL) {
                const items = await createSQL({ type: entity.type, entity: entity.entity, values: values })
                return items
            }
        }
        catch (error) {
            throw error
        }
    }

}

async function createOneSQL(obj) {
    try {
        const query = buildInsertQuery(obj.entity, obj.values)
        console.log({ query });
        const ans = await create(query)
        if (ans) {
            return ans
        }
        else
            return 'no effect'
    }
    catch (error) {
        throw error
    }
}

async function createSQL({ type, entity, values }) {
    try {
        let newObj
        let ans
        if (Array.isArray(values)) {
            for (let i = 0; i < values.length; i++) {
                newObj = { type, entity, values: values[i] }
                newObj = addItem({ item: newObj })
                ans = await createOneSQL(newObj)
                // if (ans.rowsAffected[0]) {
                //     ans.rowsAffected++
                // }
            }
        }
        else {
            newObj = { type, entity, values }
            newObj = addItem({ item: newObj })
            ans = await createOneSQL(newObj)
        }
        // if (ans.rowsAffected > 0) {
        //     ans.rowsAffected--
        //     return ans
        // }
        return ans
    }
    catch (error) {
        throw error
    }
}

async function startTransaction({ project, entityName, value }) {
    try {
        console.log({ value })
        const { addedDate, userName, disabled } = value
        const entity = getEntityConfigData({ project, entityName })
        if (entity.type === DBTypes.SQL) {
            let tran = []
            let origin = { ...value }
            for (const key in value) {
                if (typeof value[key] == 'object') {
                    console.log({ key }, value[key])
                    let obj = { entity: key }
                    obj.values = value[key].map(data => ({ ...data, addedDate, userName, disabled }))
                    tran = [...tran, obj]
                    origin = removeKeysFromObject(origin, [key])
                }
            }
            const types = getTableColumns(entity.entity)

            const items = await createTransaction({ project, entity, object: origin, tran: tran, trys: entity })
            return items
        }
    }
    catch (error) {
        console.log(error)
    }
}



module.exports = { createOneSQL, createSQL, startCreate, startTransaction }
