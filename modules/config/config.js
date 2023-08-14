require('dotenv');
const fs = require('fs');
const { types } = require('./config.objects');
const { SQL_DBNAME } = process.env
const { DBTypes } = require('../../utils/types')



function getEntityFromConfig(configUrl) {
    console.log({ configUrl })
    const response = fs.readFileSync(configUrl)
    return JSON.parse(response)
}

function getTableFromConfig(configUrl, tableName) {

    const config = getEntityFromConfig(configUrl)
    let sql = config.find(db => db.db[0].type == DBTypes.SQL)
    sql = sql.db[0]
    let table = sql.collections.find(tbl => tbl.MTDTable.collectionName.sqlName.toLowerCase() == tableName.toLowerCase() ||
        tbl.MTDTable.collectionName.name.toLowerCase() == tableName.toLowerCase())
    return table

}

function getTableAlias(config, tableSqlName) {
    console.log({ config, tableSqlName })
    try {
        const table = getTableFromConfig(config, tableSqlName)
        return table.MTDTable.collectionName.name
    }
    catch (error) {
        throw error
    }
}

function getPrimaryKeyField(configUrl, tablename) {
    const table = getTableFromConfig(configUrl, tablename)
    let col = table.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
    if (col) {
        return col.sqlName
    }
    return undefined
}

function getTableColumns(configUrl, tablename, columns = []) {
    try {
        const table = getTableFromConfig(configUrl, tablename)
        let cols
        if (columns.length != 0)
            cols = table.columns.filter(col => columns.includes(col.name)).map(({ name, sqlName, type }) => ({ name, sqlName, type: type.trim().split(' ')[0] }))
        else
            cols = table.columns.map(({ name, sqlName, type }) => ({ name, sqlName, type: type.trim().split(' ')[0] }))
        return cols
    }
    catch (error) {
        throw error
    }
};

function parseNodeToSql({ type, value }) {
    const parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
    if (!parse) {
        let error = {}
        error.description = `Type: ${type} does not exist.`
        throw error
    }

    const sqlValue = parse.parseNodeTypeToSqlType(value);
    return sqlValue
}

function buildSqlCondition(configUrl, tableName, condition) {
    const tablealias = getTableAlias(configUrl, tableName)
    let sqlCondition = ''
    if (condition) {
        const columns = getTableColumns(configUrl, tableName, Object.keys(condition))
        columnNames = columns.map(({ name }) => name)
        if (Object.keys(condition).every(c => columnNames.includes(c))) {
            const entries = Object.entries(condition)
            const sqlNames = entries.map(col => ({ key: col[0], sqlCol: columns.find(c => c.name === col[0]).sqlName, type: columns.find(c => c.name === col[0]).type, value: col[1] }))

            const conditionList = sqlNames.map(c =>
                `${tablealias}.${c.sqlCol} =  ${parseNodeToSql({ type: c.type, value: c.value })}`
            )
            sqlCondition = conditionList.join(' AND ')
        }
    }
    else {
        sqlCondition = "1 = 1"
    }
    return sqlCondition
}

function getSelectedColumns(configUrl, entityFields) {
    const { entity, fields } = entityFields
    const myTable = getTableFromConfig(configUrl, entity)
    const selectColumns = myTable.columns.filter(col => fields.includes(col.name))
    return selectColumns

}

function buildSqlJoinAndSelect(configUrl, tableName, fields) {
console.log({fields});
    const myTable = getTableFromConfig(configUrl, tableName)
    const tableAlias = getTableAlias(configUrl, tableName)
    const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    // let columnsSelect = [{ tableName: myTable.MTDTable.collectionName.name, columnsName: [...myTable.columns.map(({ sqlName, name }) => ({ sqlName, name }))] }];
    let selectedColumns = [...myTable.columns.map(({ sqlName, name }) => ({ sqlName, name, alias: tableAlias }))]
    console.log({selectedColumns})
    if (fields.length > 0) {
        selectedColumns = selectedColumns.filter(col => fields.includes(col.name))
    }
    
    let join = `${myTable.MTDTable.collectionName.sqlName} ${myTable.MTDTable.collectionName.name}`;
    // columns.forEach(column => {
    //     const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
    //     const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
    //     const thisTable = getTableFromConfig(configUrl, tableToJoin);
    //     const alias = thisTable.MTDTable.collectionName.name;
    //     columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} as FK_${column.name}_${columnToJoin}`, `${thisTable.MTDTable.defaultColumn} as FK_${column.name}_${thisTable.MTDTable.defaultColumn}`] }];
    //     join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.collectionName.name}.${column.sqlName}=${alias}.${columnToJoin}`;
    // });

    let select = selectedColumns.map(({ alias, name, sqlName }) => `${alias}.${sqlName} as ${name}`);

    select = select.join(', ');

    return `SELECT ${select} FROM ${tableAlias}`
}

const getSqlQueryFromConfig = (configUrl, entity, condition = {}, fields = []) => {
    console.log({ fields})
    const tableName = entity.collectionName.sqlName
    let sqlQuery = buildSqlJoinAndSelect(configUrl, tableName, fields)
    if (Object.keys(condition).length > 0) {
        let conditionString = buildSqlCondition(configUrl, tableName, condition)
        sqlQuery = `${sqlQuery} WHERE ${conditionString}`;
    }
    else{
        sqlQuery = `${sqlQuery} WHERE 1=1`;
    }
    return `use ${entity.dbName} ${sqlQuery}`;

}




function composeSQLColumns(columns) {
    const columnsList = columns.reduce((arr, col) => arr = [...arr, `'${col}'`], [])
    return columnsList.join(',')
}

function parseNodeToSql({ type, value }) {
    const parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
    if (!parse) {
        let error = {}
        error.description = `Type: ${type} does not exist.`
        throw error
    }

    const sqlValue = parse.parseNodeTypeToSqlType(value);
    return sqlValue
}



function parseSQLType(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        let str = []
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] != null) {
                let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
                const parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
                if (!parse) {
                    let error = {}
                    error.description = `Type: ${type} does not exist.`
                    throw error
                }

                const val = parse.parseNodeTypeToSqlType(obj[keys[i]]);
                str.push(val);
            }
            else {
                str.push('NULL')
            }
        }
        return str
    }
    catch (error) {
        // if (error.status == 513) {
        throw error
        // }
        // throw notifictaions.find(n => n.status == 400)
    }
}

function parseSQLTypeForColumn(col, tableName) {
    const tabledata = getSqlTableColumnsType(tableName)
    let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == col.name.trim().toLowerCase()).type
    let parse
    try {
        parse = types[type.toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
    }
    catch {
        let error = notifictaions.find(n => n.status == 513)
        error.description = `Type: ${type} does not exist.`
        throw error
    }
    const val = parse.parseNodeTypeToSqlType(col.value);
    return val
}


module.exports = {
    getEntityFromConfig,
    getTableFromConfig,
    getTableAlias,
    getPrimaryKeyField,
    getTableColumns,
    getSqlQueryFromConfig,
    buildSqlCondition,
    composeSQLColumns,
    parseSQLType,
    parseSQLTypeForColumn
}