const { types } = require('./config.objects');
const { SQL_DBNAME } = process.env
const { DBTypes } = require('../../utils/types')
const { getEntityFromConfig } = require('./config')



// function getTableFromConfig(configUrl, tableName) {

//     const config = getEntityFromConfig(configUrl, tableName)

// }

function getTableAlias(table) {
    try {
        return table.MTDTable.entityName.name
    }
    catch (error) {
        throw error
    }
}

function getPrimaryKeyField(table) {
    let col = table.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
    if (col) {
        return col.sqlName
    }
    return undefined
}

function getTableColumns(entity, columns = []) {
    try {
        // const table = getTableFromConfig(configUrl, tablename)
        let cols
        if (columns.length != 0)
            cols = entity.columns.filter(col => columns.includes(col.name)).map(({ name, sqlName, type }) => ({ name, sqlName, type: type.trim().split(' ')[0] }))
        else
            cols = entity.columns.map(({ name, sqlName, type }) => ({ name, sqlName, type: type.trim().split(' ')[0] }))
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

function buildSqlCondition(entity, condition) {
    const tablealias = getTableAlias(entity)
    let sqlCondition = ''
    if (condition) {
        const columns = getTableColumns(entity, Object.keys(condition))

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

function getPKConnectionBetweenEntities(mainEntity, condition) {
    // const mainPrimaryKey = getPrimaryKeyField(mainEntity)
    // return `${mainEntity.MTDTable.entityName.sqlName}.${mainPrimaryKey} = ${getTableAlias(subEntity)}.${joincolumn[0].sqlName}`
    return buildSqlCondition(mainEntity, condition)
}

function getLeftJoinBetweenEntities(mainEntity, subEntity) {
    const mainPrimaryKey = getPrimaryKeyField(mainEntity)
    const referenceString = `REFERENCES ${mainEntity.MTDTable.entityName.sqlName}(${mainPrimaryKey})`
    const tableAlias = getTableAlias(mainEntity)
    const joincolumn = subEntity.columns.filter(({ type }) => type.includes('FOREIGN KEY') && type.includes(referenceString))
    const subAlias = getTableAlias(subEntity)
    return `LEFT JOIN ${mainEntity.MTDTable.entityName.sqlName} ${tableAlias} ON ${mainEntity.MTDTable.entityName.name}.${mainPrimaryKey}=${subAlias}.${joincolumn[0].sqlName}`
}


function buildSqlJoinAndSelect(entity, fields) {
    let tableAlias = getTableAlias(entity)
    // const columns = entity.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    let selectedColumns = [...entity.columns.map(({ sqlName, name }) => ({ sqlName, name, alias: tableAlias }))]
    if (fields.length > 0) {
        selectedColumns = selectedColumns.filter(col => fields.includes(col.name))
    }

    tableAlias = `${entity.MTDTable.entityName.sqlName} ${tableAlias}`;
    // columns.forEach(column => {
    //     const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
    //     const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
    //     const thisTable = getTableFromConfig(configUrl, tableToJoin);
    //     const alias = thisTable.MTDTable.entityName.name;
    //     columnsSelect = [...columnsSelect, { tableName: alias, columnsName: [`${columnToJoin} as FK_${column.name}_${columnToJoin}`, `${thisTable.MTDTable.defaultColumn} as FK_${column.name}_${thisTable.MTDTable.defaultColumn}`] }];
    //     join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.entityName.name}.${column.sqlName}=${alias}.${columnToJoin}`;
    // });

    let select = selectedColumns.map(({ alias, name, sqlName }) => `${alias}.${sqlName} as ${name}`);

    select = select.join(', ');
    console.log({ select })
    return `SELECT ${select} FROM ${tableAlias}`
}

const getSqlQueryFromConfig = (entity, condition = {}, fields = [], joinToMainTable = undefined) => {
    let sqlQuery = buildSqlJoinAndSelect(entity, fields)
    if (joinToMainTable) {
        sqlQuery = `${sqlQuery} ${joinToMainTable}`
    }
    let conditionList = []
    if (condition.connectEntitiesCondition) {
        conditionList.push(condition.connectEntitiesCondition)
    }
    delete condition.connectEntitiesCondition
    if (Object.keys(condition).length > 0) {

        conditionList.push(buildSqlCondition(entity, condition))
    }
    else {
        conditionList.push('1=1')

    }
    sqlQuery = `${sqlQuery} WHERE ${conditionList.join(' AND ')}`

    return `use ${entity.dbName} ${sqlQuery}`;

}




function composeSQLColumns(columns) {
    const columnsList = columns.reduce((arr, col) => arr = [...arr, `'${col}'`], [])
    return columnsList.join(',')
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
    // getTableFromConfig,
    getTableAlias,
    getPrimaryKeyField,
    getTableColumns,
    getSqlQueryFromConfig,
    getPKConnectionBetweenEntities,
    getLeftJoinBetweenEntities,
    buildSqlCondition,
    composeSQLColumns,
    parseSQLType,
    parseSQLTypeForColumn
}