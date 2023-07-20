const { update } = require('../services/db/sql/sql-operation')
const { DBTypes, buildSqlCondition } = require('./config/config')
const { findCollection, getEntityConfigData } = require('./functions')


async function startupdate({ project, entityName, set, condition }) {
    try {
        const entity = getEntityConfigData({ project, entityName })
        if (entity.type === DBTypes.SQL) {
            const items = await updateManySql({ type: entity.dbName, entity: entity.collectionName.sqlName, set: set, condition: condition })
            return items
        }
    }
    catch (error) {
        throw error
    }

}

// async function updateOneSQL(obj) {
//     try {
//         console.log({ obj });
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

async function updateManySql(obj) {
    try {
        let condition = buildSqlCondition(obj.entity, obj.condition)
        let ans = await update(obj.type, obj.entity, obj.set, condition)
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
