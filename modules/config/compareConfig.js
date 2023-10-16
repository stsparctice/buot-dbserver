const { SQL_DBNAME } = process.env;
const { getPool } = require('../../services/db/sql/sql-connection');
const { getTableKeys, getForeignKeysData, sqlKeyTypes, getSqlColumns, getIdentityColumns } = require('../../services/db/sql/sql-operation');
const { getSqlDBWithTablesfromConfig } = require('./config');

async function compareConfigWithSql(projectUrl = 'wl') {

    const dataBases = getSqlDBWithTablesfromConfig(projectUrl)
    for (let database of dataBases) {
        const { dbName, db } = database
        console.log({ dbName, db })
        for (let tables of db) {
            checkDataBase(dbName, tables)
        }
    }
}

async function checkDataBase(dbName, tables) {
    for (let table of tables) {
        await buildSqlColumnsToCompare(dbName, table)
    }
}

async function buildSqlColumnsToCompare(dbName, table) {
    const { tablename } = table
   const sqlColumns = await getSqlColumns(dbName, tablename)
    const sqlUniqueKeys = await getTableKeys(dbName, tablename, sqlKeyTypes.UNIQUE)
    const sqlPrimaryKeys = await getTableKeys(dbName, tablename, sqlKeyTypes.PRIMARY_KEY)
    const sqlForeignKeys = await getTableKeys(dbName, tablename, sqlKeyTypes.FOREIGN_KEY)
    const sqlIdentityColumns = await getIdentityColumns(dbName, tablename)
    let sqlConfigColumns = sqlColumns.map(col => convertSqlToConfig(col))

    if (sqlPrimaryKeys.length > 0) {
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const primarykey = sqlPrimaryKeys.find(pk => pk.name === col.sqlName)
            if (primarykey) {
                col.primarykey = true
            }
            return col
        })
    }

    if (sqlUniqueKeys.length > 0) {
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const uniquekey = sqlUniqueKeys.find(uk => uk.name === col.sqlName)
            if (uniquekey) {
                col.uniquekey = true
            }
            return col
        })
    }

    if(sqlIdentityColumns.length>0){
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const isIdentity = sqlIdentityColumns.find(id => id.name === col.sqlName)
            if (isIdentity) {
                col.isIdentity = true
            }
            return col
        })
    }
    if (sqlForeignKeys.length > 0) {
        const foreignkeys = await getForeignKeysData(dbName, tablename)
        sqlConfigColumns = sqlConfigColumns.map(col => {
            const foreignkey = foreignkeys.find(fk => fk.column === col.sqlName)
            if (foreignkey) {
                col.foreignkey = foreignkey
            }
            return col
        })
    }
//  const part = sqlConfigColumns.slice(30)
//      console.log(sqlConfigColumns)
}


function convertSqlToConfig({ name, type, max, isnull }) {
    const convertColumn = { sqlName: name, type: { type: type.toUpperCase() } }
    if (max) {
        if(max===-1){
            max = 'MAX'
        }
        convertColumn.type.max = max
    }
    if (isnull === 'NO') {
        convertColumn.type.isnull = false
    }
    else{
        convertColumn.type.isnull = true
    }
    return convertColumn

}


module.exports = { compareConfigWithSql }


