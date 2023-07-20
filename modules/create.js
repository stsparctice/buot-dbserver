const { create } = require('../services/db/sql/sql-operation')
const { createArrColumns, createArrValues, findCollection, getEntityConfigData } = require('../modules/functions')
const { DBTypes } = require('./config/config')

async function startCreate({ project, entityName, values }) {
    try {
        const entity = getEntityConfigData({ project, entityName })
        if (entity.type === DBTypes.SQL) {
            const items = await createManySQL({ type: entity.dbName, entity: entity.collectionName.sqlName, values: values })
            console.log({ items })
            return items
        }
    }
    catch (error) {
        throw error
    }

}

async function createOneSQL(obj) {
    try {
        console.log(obj, 'obj in creatOne');
        let arr = createArrColumns(Object.keys(obj.values))
        let arr2 = createArrValues(Object.values(obj.values))
        let ans = await create(obj.type, obj.entity, arr.join(','), arr2.join(','))
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
                ans.rowsAffected ++
            }
        }
        if (ans)
            return ans
        return 'no effect'
    }
    catch (error) {
        throw error
    }
}

module.exports = { createOneSQL, createManySQL, startCreate }
