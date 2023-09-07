const { create, createTrac } = require('../services/db/sql/sql-operation')
const { createArrColumns } = require('../modules/functions')
const { getEntityConfigData } = require('./config/config')
const { parseObjectValuesToSQLTypeArray, getTableColumns } = require('./config/config.sql')
const { DBTypes } = require('../utils/types')
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
        let arr = createArrColumns(Object.keys(obj.values))
        let values = parseObjectValuesToSQLTypeArray(obj.values, types)
        const ans = await create( obj.entity, arr.join(','), values.join(','))
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

async function createSQL({type, entity, values}) {
    try {
        let newObj
        let ans
        if (Array.isArray(values)){
            for (let i = 0; i < values.length; i++) {
                newObj = { type, entity, values: values[i] }
                ans = await createOneSQL(newObj)
                // if (ans.rowsAffected[0]) {
                //     ans.rowsAffected++
                // }
            }
        }
        else{
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
        // database, entity, columns, values, tran
        const entity = getEntityConfigData({ project, entityName })

        let tran = []
        let finalyValues = {}
        for (const key in value) {
            if (typeof value[key] == 'object') {
                let obj = {}
                obj[key] = value[key]
                tran = { ...tran, ...obj }
            }

            else {
                let obj = {}
                obj[key] = value[key]
                finalyValues = { ...finalyValues, ...obj }
            }
        }
        const types = getTableColumns(entity)
        let columns = createArrColumns(Object.keys(finalyValues)).join(',')
        let values = parseObjectValuesToSQLTypeArray(finalyValues, types).join(',')
        if (entity.type === DBTypes.SQL) {
            const items = await createTrac({ database: entity.dbName, entity: entity.MTDTable.entityName.sqlName, columns: columns, values: values, tran: tran })
            return items
        }

    }
    catch (error) {

    }
}



module.exports = { createOneSQL, createSQL, startCreate, createTranzaction }
