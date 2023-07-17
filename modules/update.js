const { update } = require('../services/db/sql/sql-operation')
const { findCollection } = require('./functions')

async function updateOneSQL(obj) {
    try {
        let find = findCollection(obj.entity)
        let ans = await update(find.dbName, obj.entity, obj.set, obj.condition)
        if (ans.rowsAffected[0] > 0)
            return ans.rowsAffected[0]
        return 'no effect'
    }
    catch (error) {
        throw error;
    }
}

async function updateManySql(obj) {
    try {
        let find = findCollection(obj.entity)
        let ans = await update(find.dbName, obj.entity, obj.set, obj.condition)
        if (ans.rowsAffected[0] > 0)
            return ans.rowsAffected[0]
        return 'no effect'
    }
    catch (error) {
        throw error;
    }
}

module.exports = { updateOneSQL, updateManySql }
