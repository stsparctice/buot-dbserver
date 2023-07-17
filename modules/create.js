const { create } = require('../services/db/sql/sql-operation')
const { createArrColumns, createArrValues, findCollection } = require('../modules/functions')

async function createOneSQL(obj) {
    try {
        let find = findCollection(obj.entity)
        let tableName = find.collectionName.sqlName
        let arr = createArrColumns(Object.keys(obj.values))
        let arr2 = createArrValues(Object.values(obj.values))
        let ans = await create(find.dbName, tableName, arr.join(','), arr2.join(','))
        if (ans.rowsAffected[0] > 0)
            return ans.rowsAffected[0]
        return 'no effect'
    }
    catch (error) {
        throw error
    }
}

async function createManySQL(obj) {
    try {
        let newObj
        for (let i = 0; i < obj.values.length; i++) {
            newObj = { entity: obj.entity, values: obj.values[i] }
            await createOneSQL(newObj)
        }
        if (ans)
            return ans
        return 'no effect'
    }
    catch (error) {
        throw error
    }
}

module.exports = { createOneSQL, createManySQL }
