const { create, createTrac, buildColumnsValuesPair } = require('../services/db/sql/sql-operation')
const { getEntityConfigData } = require('./config/config')
const { parseObjectValuesToSQLTypeArray, getTableColumns, getSqlTableColumnsType, removeIdentityDataFromObject } = require('./config/config.sql')
const { DBTypes } = require('../utils/types')
const { deleteKeysFromObject } = require('../utils/code/objects')
async function startCreate({ project, entityName, values }) {
    try {
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

async function createOneSQL(obj) {
    try {
        const types = getTableColumns(obj.entity)
        
        let { columns, values } = buildColumnsValuesPair(obj.values, types)
        const ans = await create(obj.entity, columns.join(','), values.join(','))
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
                ans = await createOneSQL(newObj)
                // if (ans.rowsAffected[0]) {
                //     ans.rowsAffected++
                // }
            }
        }
        else {
            newObj = { type, entity, values }
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

async function createTranzaction({ project, entityName, value }) {
    try {
        console.log({ value })
        const { addedDate, userName, disabled } = value
        const {entity, type} = getEntityConfigData({ project, entityName })
        if (type === DBTypes.SQL) {
            let tran = []
            let finalyValues = {}
            let origin = { ...value }
            for (const key in value) {
                if (typeof value[key] == 'object') {
                    console.log({ key }, value[key])
                    let obj = { entity: key }
                    obj.values = value[key].map(data => ({ ...data, addedDate, userName, disabled }))
                    tran = [...tran, obj]
                    origin = deleteKeysFromObject(origin, [key])
                }
            }
            console.log({ origin })
            console.log(tran[1])
            const types = getTableColumns(entity)
            let { columns, values } = buildColumnsValuesPair(origin, types)

            const items = await createTrac({ project, entity, columns: columns.join(','), values: values.join(','), tran: tran, trys: entity })
             return items
        }
    }
    catch (error) {
        console.log(error)
    }
}



module.exports = { createOneSQL, createSQL, startCreate, createTranzaction }
