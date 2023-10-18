const { update } = require('../services/db/sql/sql-operation')
const { DBTypes } = require('../utils/types')
const { buildSqlCondition, removeIdentityDataFromObject, getTableName } = require('./config/config.sql')
// const { DBTypes, buildSqlCondition } = require('./config/config')
const { findCollection, getEntityConfigData } = require('./config/config')


async function startupdate({ project, entityName, set, condition }) {
    try {
        const { entity, type } = getEntityConfigData({ project, entityName })
        if (type === DBTypes.SQL) {
            const items = await updateManySql({ type: entity.dbName, entity, set: set, condition: condition })
            return items
        }
    }
    catch (error) {
        throw error
    }

}

// async function updateOneSQL(obj) {
//     try {
//         // let find = findCollection(obj.entity)
//         let ans = await update(obj.type, obj.entity, obj.set, obj.condition)
//         if (ans.rowsAffected[0] > 0)
//             return ans.rowsAffected[0]
//         return 'no effect'
//     }
//     catch (error) {
//         throw error;
//     }
// }

async function updateManySql({ type, entity, set, condition }) {
    try {
        condition = buildSqlCondition(entity, condition)
        set = removeIdentityDataFromObject(entity, set)
        const alias = await getTableAlias(entity)
        const tablename = await getTableName(entity)
        const sqlObject = parseObjectValuesToSQLTypeObject(set, entity.columns)
        const entries = Object.entries(sqlObject).map(e => ({ key: e[0], value: e[1] }))
        const updateValues = entries.map(({ key, value }) => `${alias}.${key} = ${value}`).join(',')
        let ans = await update(type, {tablename, alias}, updateValues, condition)
        if (ans) {
            return ans
        }
        return 'no effect'
    }
    catch (error) {
        throw error;
    }
}
async function updateOneMongo() { }
async function updateManyMongo() { }

module.exports = { updateManySql, updateOneMongo, updateManyMongo, startupdate }
