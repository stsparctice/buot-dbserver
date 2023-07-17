const { read, readAll, readMany } = require("../services/db/sql/sql-operation")
const { createArrColumns, createArrValues, findCollection } = require('../modules/functions')
const { buildSqlCondition, viewConnectionsTables, composeSQLColumns } = require("./config/config")

//!
async function readManyInQuery(obj) {

    let list
    try {
        let db = findCollection(obj.entity)
        obj.columns = '*'
        obj.entity = db.collectionName.sqlName
        list = await readMany(db.dbName, obj);
        return list;
    }
    catch {
        return []
    }
}


async function readManyInBody(obj) {
    try {
        let db = findCollection(obj.entity)
        // console.log(obj.values);
        // let condition = ''
        // if (obj.values[1]) {
        //     for (let i in obj.values) {
        //         if (condition != '')
        //             condition += ' and '
        //         condition += ` ${i} = '${obj.values[i]}' `
        //     }
        //     obj.condition=condition
        // }
        console.log(db);
        console.log(db.dbName);
        let ans = await readAll(db.dbName, obj)
        if (ans)
            return ans
        return "not deleted"
    }
    catch (error) {
        throw error;
    }
}


//from buyton db server
async function connectTables(tableName = "", condition = {}, columns = '*') {
    try {
        const query = viewConnectionsTables(tableName, condition);
        const values = await read(query);

        const items = []
        for (let val of values) {
            const entries = Object.entries(val)
            const foreignkeys = entries.filter(e => e[0].startsWith('FK'))

            let groups = foreignkeys.reduce((gr, fk) => {
                const prop = fk[0].split('_')[1]
                if (!gr.some(g => g.name === prop)) {
                    let group = { name: prop, values: [fk] }
                    gr = [...gr, group]
                }
                else {
                    gr.find(g => g.name === prop).values.push(fk)
                }
                return gr
            }, [])



            const newObj = entries.reduce((obj, ent) => {
                if (ent[0].startsWith('FK')) {
                    return obj
                }
                // const gr = groups.find(g => g.name.indexOf(ent[0]) !== -1)
                const gr = groups.find(g => g.name.toLowerCase() === ent[0].toLowerCase())
                if (gr) {
                    obj[ent[0]] = gr.values.reduce((val, v) => {
                        const split = v[0].split('_')
                        val[split[split.length - 1]] = v[1]
                        return val
                    }, {})
                }
                else {
                    obj[ent[0]] = ent[1]
                }
                return obj
            }, {})

            items.push(newObj)
        }
        return items;

    }
    catch (error) {
        console.log({ error })
        throw error
    }
}

module.exports = {
    readManyInQuery,
    readManyInBody,
    connectTables
}
