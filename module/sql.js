// const { create, read, update, deleted, innerJoin } = require('../services/db/sql/sql-operation')

// async function createSQL(database, obj) {
//     let ans = await create(database, obj.entity, obj.values)
//     return ans
// }

// async function updateSQL(database, obj) {
//     let ans = await update(database, obj.entity, obj.set, obj.condition)
//     return ans
// }

// async function readSQL(database, obj) {
//     let ans
//     if (!obj.secondTableName) {
//         ans = await read(database, obj.entity, obj.columns, obj.condition, obj.top)
//     }
//     else {
//         ans = await innerJoin(obj.entity, obj.secondTableName, obj.columns, obj.on, obj.condition, database)
//     }
//     return ans[0]
// }

// async function deleteSQL(database, obj) {
//     let ans = await deleted(database, obj.entity, obj.condition)
//     return ans
// }

// module.exports = { createSQL, updateSQL, readSQL, deleteSQL }
