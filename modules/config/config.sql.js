const { types } = require('./config.objects');
const { SQL_DBNAME } = process.env
const { DBTypes } = require('../../utils/types')
const { getEntityFromConfig } = require('./config');
const { deleteKeysFromObject } = require('../../utils/code/objects');
const config = require('../../data/waiting-list.json')


// function getTableFromConfig(configUrl, tableName) {

//     const config = getEntityFromConfig(configUrl, tableName)

// }

function getTableAlias(entity) {
    try {
        return entity.MTDTable.entityName.name
    }
    catch (error) {
        throw error
    }
}

function getTableName(entity) {
    try {
        return entity.MTDTable.entityName.sqlName
    }
    catch (error) {
        throw error
    }
}

function getPrimaryKeyField(table) {
    console.log(table, 'tttt');
    let col = table.columns.find(col => (col.primarykey === true))
    console.log({ col });
    if (col) {
        return { name: col.name, sqlName: col.sqlName }
    }
    console.log('undefined')
    return undefined
}

function getTableColumns(entity, columns = []) {
    try {
        let cols
        console.log(columns);
        if (columns.length != 0) {
            cols = entity.columns.filter(col => columns.includes(col.name)).map(({ name, sqlName, type }) => ({ name, sqlName, type: type.type }))
        }
        else {
            cols = entity.entity.columns.map(({ name, sqlName, type }) => ({ name, sqlName, type: type.type }))
        }

        return cols
    }
    catch (error) {
        throw error
    }
};

function parseNodeToSql({ type, value }) {
    console.log({ type, value })
    const parse = types[type]
    if (!parse) {
        let error = {}
        error.description = `Type: ${type} does not exist.`
        throw error
    }

    const sqlValue = parse.parseNodeTypeToSqlType(value);
    return sqlValue
}


function removeIdentityDataFromObject(entity, object) {
    const { columns } = entity
    const identities = columns.filter(c => c.isIdentity)
    const removeKeys = identities.map(({ name }) => name)
    object = deleteKeysFromObject(object, removeKeys)
    //  const {id, ...rest} = object
    return object

}

function buildSqlCondition(entity, condition) {
    console.log({ condition })
    const tablealias = getTableAlias(entity)
    let sqlCondition = ''
    if (condition) {
        const columns = getTableColumns(entity, Object.keys(condition))
        const entityKeys = Object.keys(condition).filter(key => columns.find(({ name, sqlName }) => key === name || key === sqlName))
        if (entityKeys.length > 0) {
            const entries = Object.entries(condition)
            const sqlNames = entries.map(col => ({ key: col[0], sqlCol: columns.find(c => c.name === col[0]).sqlName, type: columns.find(c => c.name === col[0]).type, value: col[1] }))

            const conditionList = sqlNames.map(c =>
                `${tablealias}.${c.sqlCol} =  ${parseNodeToSql({ type: c.type, value: c.value })}`
            )
            sqlCondition = conditionList.join(' AND ')
            console.log({ sqlCondition })
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
    console.log(subEntity, 'subEntity');
    const mainPrimaryKey = getPrimaryKeyField(mainEntity).sqlName
    console.log({ mainPrimaryKey })
    const tableAlias = getTableAlias(mainEntity)
    const joincolumn = subEntity.columns.filter((col) => col.foreignkey && col.foreignkey.ref_table === mainEntity.MTDTable.entityName.sqlName && col.foreignkey.ref_column === mainPrimaryKey)
    console.log(subEntity.columns.filter((col) => col.foreignkey))
    console.log(mainEntity.MTDTable.entityName.sqlName)
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
    const foreignKeyColumns = entity.columns.filter(col => col.foreignkey);

    if (foreignKeyColumns.length > 0) {
        foreignKeyColumns.forEach(column => {

            const tableToJoin = column.foreignkey.ref_table;
            const columnToJoin = column.foreignkey.ref_column;
            const joinEntity = getEntityFromConfig(configUrl, tableToJoin);
            console.log({ columnToJoin })
            const columnName = joinEntity.entity.columns.find(c => c.sqlName.toLowerCase() === columnToJoin.toLowerCase())
            console.log(columnName)
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
        console.log({ condition })
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


function parseObjectValuesToSQLTypeObject(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        let sqlObject = {}
        for (let i = 0; i < keys.length; i++) {
            let { type, sqlName } = tabledata.find(td => td.name.trim().toLowerCase() == keys[i].trim().toLowerCase())
            if (obj[keys[i]] != null) {
                const parse = types[type.type]
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
        return sqlObject
    }
    catch (error) {
        throw error
    }
}
function parseObjectValuesToSQLTypeArray(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        let str = []
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] != null) {
                let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase())
                console.log(type.type)
                const parse = types[type.type]
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
        parse = types[type.type]
    }
    catch {
        let error = notifictaions.find(n => n.status == 513)
        error.description = `Type: ${type} does not exist.`
        throw error
    }
    const val = parse.parseNodeTypeToSqlType(col.value);
    return val
}

function getSqlTableColumnsType(tablename) {
    try {
        const table = getTableFromConfig(tablename)
        console.log(table,'-----------------');
        let col = table.columns.map(col => ({ sqlName: col.sqlName, type: col.type.type }))
        return col
    }
    catch (error) {
        throw error
    }
};
function getTableFromConfig(tableName) {
    let sql = config.find(db => db.db[0].type == 'sql')//????????????????????????????
    sql = sql.db[0]
    // let tables = sql.collections.find(obj => obj.type == 'Tables').list
    let table = sql.collections.find(tbl => tbl.MTDTable.entityName.sqlName.toLowerCase() == tableName.toLowerCase() ||
        tbl.MTDTable.entityName.name.toLowerCase() == tableName.toLowerCase())
    return table

}


module.exports = {
    getTableFromConfig,
    getTableAlias,
    getTableName,
    getPrimaryKeyField,
    getTableColumns,
    getSqlQueryFromConfig,
    getSqlTableColumnsType,
    getPKConnectionBetweenEntities,
    getLeftJoinBetweenEntities,
    buildSqlCondition,
    removeIdentityDataFromObject,
    composeSQLColumns,
    parseNodeToSql,
    parseObjectValuesToSQLTypeArray,
    parseObjectValuesToSQLTypeObject,
    parseSQLTypeForColumn
}