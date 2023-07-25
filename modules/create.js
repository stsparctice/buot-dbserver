const { create } = require('../services/db/sql/sql-operation')
const { createArrColumns, createArrValues, findCollection, getEntityConfigData } = require('../modules/functions')
const { DBTypes, parseSQLType, getTableFromConfig, getSqlTableColumnsType } = require('./config/config')

async function startCreate({ project, entityName, values }) {
    try {
        const entity = getEntityConfigData({ project, entityName })
        if (entity.type === DBTypes.SQL) {
            const items = await createManySQL({ type: entity.dbName, entity: entity, values: values })
            return items
        }
    }
    catch (error) {
        throw error
    }

}

async function createOneSQL(obj) {
    try {
        const types = getSqlTableColumnsType(obj.entity.collectionName.sqlName)
        let arr = createArrColumns(Object.keys(obj.values))
        let values = parseSQLType(obj.values, types)
        let ans = await create(obj.type, obj.entity.collectionName.sqlName, arr.join(','), values.join(','))
        if (ans)
            return ans
        return 'no effect'
    }
    catch (error) {
        throw error
    }
}

async function createManySQL(obj) {
    try {
        let newObj
        let ans
        for (let i = 0; i < obj.values.length; i++) {
            newObj = { type: obj.type, entity: obj.entity, values: obj.values[i] }
            ans = await createOneSQL(newObj)
            if (ans) {
                ans.rowsAffected++
            }
        }
        if (ans.rowsAffected > 0){
            ans.rowsAffected--
            return ans
        }
        return 'no effect'
    }
    catch (error) {
        throw error
    }
}

module.exports = { createOneSQL, createManySQL, startCreate }
