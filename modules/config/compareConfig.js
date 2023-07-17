const config = require('../../data/newConfig.json')
const { SQL_DBNAME } = process.env;
const { getPool } = require('../../services/db/sql/sql-connection');

async function compareConfigWithSql(database = SQL_DBNAME, tableName = 'Teachers') {
  
    let tableFromSql = await getPool().request().query(`use ${database} select COLUMN_NAME,DATA_TYPE from [INFORMATION_SCHEMA].[COLUMNS]  where TABLE_NAME ='${tableName}'`)
    let tablefromConfig = config[0].db[0].collections.find(m => m.collectionName.name.toLowerCase() == tableName.toLowerCase())
    console.log(tableFromSql, 'tableFromSql');
    console.log(tablefromConfig, 'tablefromConfig');

    tableFromSql = tableFromSql.recordset
    tablefromConfig = tablefromConfig.fields

    let object = []

    _ = tableFromSql.map((itemSql) => {
        let obj1 = {}
        let ans1 = tablefromConfig.some((itemConfig) => {
            return itemSql.COLUMN_NAME.toLowerCase() == itemConfig.name.toLowerCase()
                && (itemConfig.type.toLowerCase().includes(itemSql.DATA_TYPE.toLowerCase()) || itemConfig.type.toLowerCase() == itemSql.DATA_TYPE.toLowerCase())
        })
        if (!ans1) { obj1.extra = itemSql }

        if (obj1.extra) { object.push(obj1) }
    })

    _ = tablefromConfig.map((itemConfig) => {
        let obj2 = {}
        let ans2 = tableFromSql.some((itemSql) => {
            return itemSql.COLUMN_NAME.toLowerCase() == itemConfig.name.toLowerCase()
                && (itemConfig.type.toLowerCase().includes(itemSql.DATA_TYPE.toLowerCase()) || itemConfig.type.toLowerCase() == itemSql.DATA_TYPE.toLowerCase())
        })
        if (!ans2) { obj2.less = itemConfig }

        if (obj2.less) { object.push(obj2) }
    })

    return object
}



// function compareTables(table,tableToCompare,types){
//     let object = []
//     let arr= table.map((itemSql) => {
//         let obj = {}
//         let ans = tableToCompare.some((itemConfig) => {
//             return itemSql.COLUMN_NAME.toLowerCase() == itemConfig.name.toLowerCase()
//                 && (itemConfig.type.toLowerCase().includes(itemSql.DATA_TYPE.toLowerCase()) || itemConfig.type.toLowerCase() == itemSql.DATA_TYPE.toLowerCase())
//         })
//         if (!ans) { obj[types] = itemSql }

//         if (obj.extra) { object.push(obj) }
//     })
//     return object
// }

module.exports = { compareConfigWithSql }


//from postman=>http://localhost:3485/config/config