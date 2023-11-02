const { update, createGlobalTran, compareObject } = require('../services/db/sql/sql-operation')
const { DBTypes } = require('../utils/types')
const { buildSqlCondition, removeIdentityDataFromObject, getTableName, getTableAlias, parseObjectValuesToSQLTypeObject } = require('./config/config.sql')
// const { DBTypes, buildSqlCondition } = require('./config/config')
const { getEntityConfigData } = require('./config/config')


async function startupdate({ project, entityName, set, condition }) {
    console.log('startUpdate')
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
        const alias = getTableAlias(entity)
        const tablename = getTableName(entity)
        const sqlObject = parseObjectValuesToSQLTypeObject(set, entity.columns)
        const entries = Object.entries(sqlObject).map(e => ({ key: e[0], value: e[1] }))
        const updateValues = entries.map(({ key, value }) => `${alias}.${key} = ${value}`).join(',')
        let ans = await update(type, { tablename, alias }, updateValues, condition)
        if (ans) {
            return ans
        }
        return 'no effect'
    }
    catch (error) {
        throw error;
    }
}

async function updateTranzaction({ project, entityName, value }) {
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
            const items = await createTrac({ database: entity.entity.dbName, entity: entity.entity.MTDTable.entityName.sqlName,alias:entity.entity.MTDTable.entityName.names, id: id, set: set })
            console.log(items, 'items');
            return items
        }
        // database, entity, alias, values, tran
        // if (entity.type === DBTypes.SQL) {
        //     const items = await createGlobalTran("use bubble update teachers set teacherName='estar' from tbl_Teachers as teachers where id=2 ")
        //     console.log(items, 'items');
        //     return items
        // }
    }
    catch (error) {

    }
}
// async function compareWithData(obj) {
//     console.log('in modulessssssssssssssssss');
//     try {
//         const ans = await compareObject(obj)
//         if (ans) {
//             return ans
//         }
//     }
//     catch (error) {
//         throw error
//     }

// }
async function updateOneMongo() { }
async function updateManyMongo() { }

module.exports = { updateManySql, updateTranzaction, updateOneMongo, updateManyMongo, startupdate }
