const { getTableAlias, getPrimaryKeyField, getTableColumns, getTableName, getEntityFromConfig } = require('./config');
const { removeKeysFromObject } = require('../../utils/code/objects');

const convertToSQLString = (value) => {
    console.log(value);
    let special = ["'", "&", "%", "#", "$"]
    const sqlStrings = []
    const split = value.split('')
    if (split.some(ch => special.includes(ch))) {
        for (let i = 0; i < split.length; i++) {
            let word = ''
            while (i < split.length && special.indexOf(split[i]) == -1) {
                word += split[i]
                i++
            }
            sqlStrings.push(`N'${word}'`)
            if (i < split.length && special.indexOf(split[i]) != -1) {
                sqlStrings.push(`char(${split[i].charCodeAt()})`)
            }
        }
        const concat = `concat(${sqlStrings.join(',')})`
        return concat
    }

    return `N'${value}'`
}


const types = {

    NVARCHAR: {
        typeNodeName: 'string',
        parseNodeTypeToSqlType: (value) => {
            return convertToSQLString(value)
        }
    },

    NTEXT: {
        typeNodeName: 'string',
        parseNodeTypeToSqlType: (value) => {
            return convertToSQLString(value)
        }
    },

    BIT: {
        typeNodeName: 'boolean',
        parseNodeTypeToSqlType: (boolean) => {
            return `'${boolean}'`
        }
    },

    DATETIME: {
        typeNodeName: 'Date',
        parseNodeTypeToSqlType: (date) => {
            console.log({ date })
            if (typeof (date) === 'string') {
                if (date.includes('T') && date.includes('Z')) {
                    const splitDate = date.split('T')
                    const datePart = splitDate[0]
                    const timePart = splitDate[1].split('Z')[0]
                    console.log({ datePart, timePart })
                    const datePartArray = datePart.split('-')
                    const timePartArray = timePart.split(':')
                    console.log({ timePartArray, datePartArray })
                    const times = timePartArray.map(t => parseInt(t))
                    const dates = datePartArray.map(d => parseInt(d))
                    console.log({ times, dates })
                    date = new Date(dates[0], dates[1] - 1, dates[2], times[0], times[1], times[2])
                }
                else {
                    throw new Error(`date ${date} is not in correct format`)
                }
            }

            date = new Date(date)
            console.log({ date })
            return `'${date.toISOString()}'`
        }
    },

    INT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number) || number == '')
                return 0
            else
                return number
        }
    },
    REAL: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number) || number == '')
                return 0
            else
                return number
        }
    },
    FLOAT: {
        typeNodeName: 'number',
        parseNodeTypeToSqlType: (number) => {
            if (isNaN(number) || number == '')
                return 0
            else
                return number
        }
    }
}




const buildInsertQuery = (entity, data) => {
    console.log({ data });
    let primarykey = getPrimaryKeyField(entity).name
    const types = getTableColumns(entity)
    const { columns, values } = buildColumnsValuesPair(data, types)
    const tableName = entity.MTDTable.entityName.sqlName
    const query = `use ${entity.dbName} INSERT INTO ${tableName} (${columns}) VALUES ( ${values} ) ; SELECT @@IDENTITY ${primarykey}`
    return query
}

const buildUpdateQuery = (entity, data, condition) => {
    try{
    const database = entity.dbName
    if (!condition) {
        const { name } = getPrimaryKeyField(entity)
        const pkValue = data[name]
        condition = Object.fromEntries([[name, pkValue]])
    }
    console.log({ condition })
    condition = buildSqlCondition(entity.entity, condition)
    console.log({condition});
    set = removeIdentityDataFromObject(entity.entity, data)
    const alias = getTableAlias(entity.entity)
    const tablename = getTableName(entity.entity)
    const sqlObject = parseObjectValuesToSQLTypeObject(set, entity.entity.columns)
    const entries = Object.entries(sqlObject).map(e => ({ key: e[0], value: e[1] }))
    const updateValues = entries.map(({ key, value }) => `${alias}.${key} = ${value}`).join(',')
    const query = `use ${database} UPDATE ${alias} SET ${updateValues} FROM ${tablename} AS ${alias} WHERE ${condition}`
    return query
}
catch(error){
    console.log({error});
}
}

const buildOneTableSelectQuery = ({ database, tablename, alias, columns = '*', condition = '1=1' }) => {

    const query = `USE ${database} SELECT ${columns} FROM ${tablename} ${alias} WHERE ${condition}`
    return query
}




function buildColumnsValuesPair(object, columns) {
    const pairs = { columns: [], values: [] }
    for (let key in object) {
        console.log({ key });
        const column = columns.find(({ name }) => name === key)
        pairs.columns.push(`[${column.sqlName}]`)
        const parse = types[column.type]
        pairs.values.push(parse.parseNodeTypeToSqlType(object[key]))
    }
    return pairs
}

function parseNodeToSql({ type, value }) {
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
    object = removeKeysFromObject(object, removeKeys)
    // console.log({object})
    //  const {id, ...rest} = object
    return object

}

function buildSqlCondition(entity, condition) {
    console.log({entity});
    const tablealias = getTableAlias(entity)
    let sqlCondition = ''
    if (condition) {
        const columns = getTableColumns(entity, Object.keys(condition))
        const entityKeys = Object.keys(condition).filter(key => columns.find(({ name, sqlName }) => key === name || key === sqlName))
        if (entityKeys.length > 0) {
            const entries = Object.entries(condition)
            const sqlNames = entries.map(col => ({ key: col[0], sqlCol: columns.find(c => c.name === col[0]).sqlName, type: columns.find(c => c.name === col[0]).type, value: col[1] }))
            console.log({ sqlNames });
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
    const mainPrimaryKey = getPrimaryKeyField(mainEntity).sqlName
    const tableAlias = getTableAlias(mainEntity)
    const joincolumn = subEntity.columns.filter((col) => col.foreignkey && col.foreignkey.ref_table === mainEntity.MTDTable.entityName.sqlName && col.foreignkey.ref_column === mainPrimaryKey)
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
            const columnName = joinEntity.entity.columns.find(c => c.sqlName.toLowerCase() === columnToJoin.toLowerCase())
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
        condition = removeKeysFromObject(condition, ['connectEntitiesCondition'])
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
        console.log(tabledata)
        const keys = Object.keys(obj)
        let sqlObject = {}
        for (let i = 0; i < keys.length; i++) {
            console.log(keys[i])
            let { type, sqlName } = tabledata.find(td => td.name.trim().toLowerCase() === keys[i].trim().toLowerCase())
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
        console.log(error);
        throw error
    }
}
function parseObjectValuesToSQLTypeArray(obj, tabledata) {
    try {
        const keys = Object.keys(obj)
        console.log('parseObjectValuesToSQLTypeArray')
        console.log(tabledata)
        console.log(obj)
        let str = []
        for (let i = 0; i < keys.length; i++) {
            if (obj[keys[i]] != null) {
                let type = tabledata.find(td => td.sqlName.trim().toLowerCase() == keys[i].trim().toLowerCase())
                console.log({ type })
                if (typeof (type) === 'object')
                    type = type.type
                const parse = types[type]
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

function getSqlTableColumnsType(entity) {
    try {
        let col = entity.columns.map(col => ({ sqlName: col.sqlName, name: col.name, type: col.type.type, update_copy: col.update_copy }))
        return col
    }
    catch (error) {
        throw error
    }
};
// function getTableFromConfig(tableName) {
//     let sql = config.find(db => db.db[0].type == 'sql')//????????????????????????????
//     sql = sql.db[0]
//     // let tables = sql.collections.find(obj => obj.type == 'Tables').list
//     let table = sql.collections.find(tbl => tbl.MTDTable.entityName.sqlName.toLowerCase() == tableName.toLowerCase() ||
//         tbl.MTDTable.entityName.name.toLowerCase() == tableName.toLowerCase())
//     return table

// }


module.exports = {
    // getTableFromConfig,
    convertToSQLString,
    buildInsertQuery,
    buildOneTableSelectQuery,
    buildUpdateQuery,
    getTableColumns,
    buildColumnsValuesPair,
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