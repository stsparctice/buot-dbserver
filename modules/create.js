const { create, createTrac } = require('../services/db/sql/sql-operation')
const { createArrColumns, createArrValues, findCollection, getEntityConfigData } = require('../modules/functions')
const { DBTypes, parseSQLType, getTableFromConfig, getSqlTableColumnsType } = require('./config/config')

async function startCreate({ project, entityName, values }) {
    try {
        const entity = getEntityConfigData({ project, entityName })

        if (entity.type === DBTypes.SQL) {

            const items = await createSQL({ type: entity.dbName, entity: entity, values: values })
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
        const ans = await create(obj.type, obj.entity.collectionName.sqlName, arr.join(','), values.join(','))
        if (ans){
            console.log("!!!!!!!!!!!");
            return ans
        }
        else
            return 'no effect'
    }
    catch (error) {
        throw error
    }
}

async function createSQL(obj) {
    try {
        let newObj
        let ans
        for (let i = 0; i < obj.values.length; i++) {
            newObj = { type: obj.type, entity: obj.entity, values: obj.values[i] }
            ans = await createOneSQL(newObj)
            // if (ans.rowsAffected[0]) {
            //     ans.rowsAffected++
            // }
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
        console.log(tran, 'tran');
        const types = getSqlTableColumnsType(entity.collectionName.sqlName)
        let columns = createArrColumns(Object.keys(finalyValues)).join(',')
        let values = parseSQLType(finalyValues, types).join(',')
        if (entity.type === DBTypes.SQL) {
            const items = await createTrac({ database: entity.dbName, entity: entity.collectionName.sqlName, columns: columns, values: values, tran: tran })
            return items
        }

    }
    catch (error) {

    }
}



module.exports = { createOneSQL, createSQL, startCreate, createTranzaction }
