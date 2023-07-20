const config = require('../../data/newConfig.json')
const fs = require('fs')
require('dotenv');
const { SQL_DBNAME } = process.env

const DBTypes = {
    SQL:'sql', MONGODB:'mongoDB'
}

function getEntityFromConfig(entityName, configUrl){
    const response = fs.readFileSync(configUrl)
    return JSON.parse(response)
}

function getTableFromConfig(tableName) {
    let sql = config.find(db => db.db[0].type == 'sql')//????????????????????????????
    sql = sql.db[0]
    // let tables = sql.collections.find(obj => obj.type == 'Tables').list
    let table = sql.collections.find(tbl => tbl.MTDTable.collectionName.sqlName.toLowerCase() == tableName.toLowerCase() ||
        tbl.MTDTable.collectionName.name.toLowerCase() == tableName.toLowerCase())
    return table

}

function buildSqlCondition(tableName, condition) {
    const tablealias = getTableFromConfig(tableName).MTDTable.collectionName.name
    if (condition) {
        const entries = Object.entries(condition)
        const conditionList = entries.map(c =>
            `${tablealias}.${c[0]} =  ${c[1]}`
            // `${tablealias}.${c[0]} =  ${parseSQLTypeForColumn({ name: c[0], value: c[1] }, tableName)}`
        )
        condition = conditionList.join(' AND ')
    }
    else {
        condition = "1 = 1"
    }
    return condition
}

function buildSqlJoinAndSelect(tableName, n) {
    const myTable = getTableFromConfig(tableName)
    const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    let columnsSelect = [{ tableName: myTable.MTDTable.collectionName.name, columnsName: [...myTable.columns.map(({ sqlName }) => sqlName)] }];
    let join = `${myTable.MTDTable.collectionName.sqlName} ${myTable.MTDTable.collectionName.name}`;
    columns.forEach(column => {
        const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
        const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
        const thisTable = getTableFromConfig(tableToJoin);
        const alias = thisTable.MTDTable.collectionName.name;
        columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} as FK_${column.name}_${columnToJoin}`, `${thisTable.MTDTable.defaultColumn} as FK_${column.name}_${thisTable.MTDTable.defaultColumn}`] }];
        join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.collectionName.name}.${column.sqlName}=${alias}.${columnToJoin}`;
    });

    let select = ``;
    columnsSelect.forEach(cs => {
        cs.columnsName.forEach(cn => {
            select = `${select} ${cs.tableName}.${cn},`;
        })
    })
    select = select.slice(0, select.length - 1);

    return `SELECT TOP ${n} ${select} FROM ${join}`
}

const viewConnectionsTables = (tableName, condition = {}, n) => {

    let join = buildSqlJoinAndSelect(tableName, n)

    if (Object.keys(condition).length > 0) {
        let conditionString = buildSqlCondition(tableName, condition)
        join = `${join} WHERE ${conditionString}`;
    }
    return `use ${SQL_DBNAME} ${join}`;
}


function getPrimaryKeyField(tablename) {
    const table = getTableFromConfig(tablename)
    let col = table.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
    if (col) {
        return col.sqlName
    }
    return false
}

async function composeSQLColumns(columns) {
    let string = ''
    for (let col of columns) {
        string += "'" + col + "'"
        string += ','

        return string


    }
}


module.exports = {
    DBTypes,
    getEntityFromConfig,
    getTableFromConfig,
    buildSqlCondition,
    viewConnectionsTables,
    getPrimaryKeyField,
    composeSQLColumns
}