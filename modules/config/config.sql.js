const { types } = require('./config.objects');
const { SQL_DBNAME } = process.env
const { DBTypes } = require('../../utils/types')
const { getEntityFromConfig } = require('./config');
const { deleteKeysFromObject } = require('../../utils/code/objects');



// function getTableFromConfig(configUrl, tableName) {

//     const config = getEntityFromConfig(configUrl, tableName)

// }

function getTableAlias(table) {
    console.log({ table })
    try {
        return table.MTDTable.entityName.name
    }
    catch (error) {
        throw error
    }
}

function getPrimaryKeyField(table) {
    console.log({ table })
    let col = table.columns.find(col => (col.type.toLowerCase().indexOf('primary') !== -1))
    if (col) {
        return col.sqlName
    }
    return undefined
}

function getTableColumns(entity, columns = []) {
    console.log({ columns })
    try {
        // const table = getTableFromConfig(configUrl, tablename)
        let cols
        console.log(entity.columns)
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


function removeIdentityDataFromObject(entity, object) {
    console.log({ entity })
    console.log('removeIdentityDataFromObject')
    const { columns } = entity
    const identities = columns.filter(c => c.type.toUpperCase().includes('IDENTITY'))
    console.log(identities)
    const removeKeys = identities.map(({ name }) => name)
    object = deleteKeysFromObject(object, removeKeys)
    //  const {id, ...rest} = object
    //  console.log({rest}) 
    console.log({ object })
    return object

}

function buildSqlCondition(entity, condition) {
    const tablealias = getTableAlias(entity)
    let sqlCondition = ''
    if (condition) {
        console.log({ condition })
        const columns = getTableColumns(entity, Object.keys(condition))
        console.log({ columns })
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
    return { tableToJoin: mainEntity.MTDTable.entityName.sqlName, alias: tableAlias, columnToJoin: mainPrimaryKey, entity2: subAlias, column2: joincolumn[0].sqlName }
}


function buildSqlJoinAndSelect(configUrl, entity, fields) {
    let tableAlias = getTableAlias(entity)
    // const columns = entity.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    let selectedColumns = [...entity.columns.map(({ sqlName, name, type }) => ({ sqlName, name, alias: tableAlias, type }))]
    if (fields.length > 0) {
        selectedColumns = selectedColumns.filter(({ name }) => fields.includes(name))
    }

    tableAlias = `${entity.MTDTable.entityName.sqlName} ${tableAlias}`;
    let joinTables = []
    console.log({ selectedColumns })
    const foreignKeyColumns = entity.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));

    if (foreignKeyColumns.length > 0) {
        foreignKeyColumns.forEach(column => {

            let startindex = column.type.toUpperCase().indexOf('REFERENCES')
            startindex += 11
            const tableToJoin = column.type.slice(startindex, column.type.indexOf('(', startindex));
            const columnToJoin = column.type.slice(column.type.indexOf('(', startindex) + 1, column.type.indexOf(')', startindex));
            const joinEntity = getEntityFromConfig(configUrl, tableToJoin);
            console.log(joinEntity)
            const columnName = joinEntity.entity.columns.find(c => c.sqlName === columnToJoin)
            const defaultColumnName = joinEntity.entity.columns.find(c => c.sqlName === joinEntity.entity.MTDTable.defaultColumn)
            const alias = getTableAlias(joinEntity.entity)
            if (joinTables.some(jt => jt.tableToJoin === tableToJoin)) {
                let count = joinTables.filter(jt => jt.tableToJoin === tableToJoin).length
                alias = `${alias}${count}`
            }
            if (selectedColumns.some(({ sqlName }) => sqlName === column.sqlName) === false) {
                selectedColumns.push({ sqlName: column.sqlName, name: column.name, type: column.type, alias })
            }
            selectedColumns.push({ alias, sqlName: columnToJoin, name: `FK_${column.name}_${columnName.name}` })
            selectedColumns.push({ alias, sqlName: joinEntity.entity.MTDTable.defaultColumn, name: `FK_${column.name}_${defaultColumnName.name}` })
            selectedColumns.push({ alias: '', sqlName: `'${joinEntity.entity.MTDTable.entityName.name}'`, name: `FK_${column.name}_entity` })

            joinTables.push({ tableToJoin, alias, columnToJoin, entity2: entity.MTDTable.entityName.name, column2: column.sqlName })
        });
    }

    let select = selectedColumns.map(({ alias, name, sqlName }) => alias != '' ? `${alias}.${sqlName} as ${name}` : `${sqlName} as ${name}`);
    select = select.join(', ');
    return { select, tableAlias, joinTables }
}

const getSqlQueryFromConfig = (configUrl, entity, condition = {}, fields = [], joinToMainTable = undefined) => {
    let { select, tableAlias, joinTables } = buildSqlJoinAndSelect(configUrl, entity, fields)

    if (joinToMainTable) {
        const sameJoinTable = joinTables.find(({ tableToJoin, alias }) => tableToJoin == joinToMainTable.tableToJoin && alias === joinToMainTable.alias)
        if (sameJoinTable) {
            if (sameJoinTable.entity2 !== joinToMainTable.entity2 || sameJoinTable.column2 !== joinToMainTable.column2 || sameJoinTable.columnToJoin !== joinToMainTable.columnToJoin) {
                joinToMainTable.tableToJoin = ''
                joinTables.push(joinToMainTable)
            }
        }
    }
    let conditionList = []

    if (condition.connectEntitiesCondition) {
        conditionList.push(condition.connectEntitiesCondition)
         condition = deleteKeysFromObject(condition, ['connectEntitiesCondition'])
    }
   
    // delete condition.connectEntitiesCondition
    if (Object.keys(condition).length > 0) {

        conditionList.push(buildSqlCondition(entity, condition))
    }
    else {
        conditionList.push('1=1')

    }
    const join = joinTables.map(({ tableToJoin, alias, columnToJoin, entity2, column2 }) => `LEFT JOIN ${tableToJoin} ${alias} ON ${entity2}.${column2}=${alias}.${columnToJoin}`)
    sqlQuery = `SELECT ${select} FROM ${tableAlias} ${join.join(' ')} WHERE ${conditionList.join(' AND ')}`

    return `use ${entity.dbName} ${sqlQuery}`;

}




function composeSQLColumns(columns) {
    const columnsList = columns.reduce((arr, col) => arr = [...arr, `'${col}'`], [])
    return columnsList.join(',')
}


function parseObjectValuesToSQLTypetoObject(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        let sqlObject = {}
        for (let i = 0; i < keys.length; i++) {
            let { type, sqlName } = tabledata.find(td => td.name.trim().toLowerCase() == keys[i].trim().toLowerCase())
            if (obj[keys[i]] != null) {
                const parse = types[type.split(' ')[0].toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
                if (!parse) {
                    let error = {}
                    error.description = `Type: ${type} does not exist.`
                    throw error
                }

                const val = parse.parseNodeTypeToSqlType(obj[keys[i]]);
                sqlObject[sqlName] = val;
            }
            else {
                sqlObject[sqlName] = 'NULL';
            }
        }
        console.log(sqlObject)
        return sqlObject
    }
    catch (error) {
        throw error
    }
}
function parseObjectValuesToSQLTypeInArray(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        let str = []
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] != null) {
                let type = tabledata.find(td => td.name.trim().toLowerCase() == keys[i].trim().toLowerCase()).type
                const parse = types[type.split(' ')[0].toUpperCase().replace(type.slice(type.indexOf('('), type.indexOf(')') + 1), '')]
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
        throw error
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
    removeIdentityDataFromObject,
    composeSQLColumns,
    parseNodeToSql,
    parseObjectValuesToSQLTypeInArray,
    parseObjectValuesToSQLTypetoObject,
    parseSQLTypeForColumn
}