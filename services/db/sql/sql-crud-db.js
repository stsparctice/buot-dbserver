const { getPool } = require('./sql-connection');
const { count, update } = require('./sql-operation');
const { parseObjectValuesToSQLTypeObject, buildUpdateQuery } = require('../../../modules/config/config.sql')
const SQLTypes = {
    NTEXT: 'NTEXT'
}


function buildColumns(details) {
    let columns = '';
    for (let i = 0; i < details.length; i++) {
        columns += (details[i]['sqlName']) + ' ' + buildColumnType(details[i]) + ', ';
    };
    columns = columns.substring(0, columns.length - 2);
    return columns;
};
// "type": "INT NOT NULL FOREIGN KEY(GenderId) REFERENCES tbl_Genders(Id)"
function buildColumnType({ type, primarykey, foreignkey, isIdentity, uniquekey, sqlName }) {
    let typeString = type.type
    if (type.max && type.type !== SQLTypes.NTEXT) {
        typeString = `${typeString}(${type.max}) `

    }
    typeString = `${typeString} ${type.isnull ? 'NULL ' : 'NOT NULL '}`
    if (isIdentity) {
        typeString = `${typeString}IDENTITY `
    }
    if (uniquekey) {
        typeString = `${typeString}UNIQUE`
    }
    if (primarykey) {
        typeString = `${typeString}PRIMARY KEY`
    }
    if (foreignkey) {
        const { ref_column, ref_table } = foreignkey
        typeString = `${typeString}FOREIGN KEY(${sqlName}) REFERENCES ${ref_table}(${ref_column})`
    }
    return typeString
}



const addColumnToTable = async (database, tablename, { sqlName }, sqlType) => {
    try {
        const response = await getPool().request().query(`USE ${database} ALTER TABLE ${tablename} ADD ${sqlName} ${sqlType} `)
        return response.recordset
    }
    catch (error) {
        throw error
    }
}

const updateColumnType = async (database, tablename, { sqlName }, sqlType) => {
    try {
        console.log(`USE ${database} ALTER TABLE ${tablename} ALTER COLUMN ${sqlName} ${sqlType}`)
        const response = await getPool().request().query(`USE ${database} ALTER TABLE ${tablename} ALTER COLUMN ${sqlName} ${sqlType} `)
        return response.recordset
    }
    catch (error) {
        throw error
    }
}

const addColumn = async function (database, { tablename, columns }, column) {
    try {

        if (column.type.isnull === false) {
            const countRows = await count(tablename)
            if (countRows) {
                const tempType = { ...column.type, isnull: true }
                let sqlType = buildColumnType({ ...column, type: tempType })
                let response = await addColumnToTable(database, tablename, column, sqlType)
                console.log({ response })

                if (column.updateCommands&& column.updateCommands.length > 0) {
                    // const set = {}
                    // const updateResponse = await Promise.all(column.updateCommands.map(async ({ value, condition }) => {
                    //     set[column.sqlName] = value
                    //     console.log({ database, tablename, set })
                    //     const query = buildUpdateQuery()
                    //     const sqlObject = parseObjectValuesToSQLTypeObject(set, columns)
                    //     const entries = Object.entries(sqlObject).map(e => ({ key: e[0], value: e[1] }))
                    //     const updateValues = entries.map(({ key, value }) => `${tablename}.${key} = ${value}`).join(',')
                    //     const response = await update(database, {tablename}, updateValues, condition)
                    //     return response
                    // }))
                    // console.log({ updateResponse })
                }
                 sqlType = buildColumnType(column)
                 response = await updateColumnType(database, tablename, column, sqlType)

                 return response

            }
        }
        else {
            const sqlType = buildColumnType(column)
            const response = await addColumnToTable(database, tablename, column, sqlType)

            return response
        }

    }
    catch (error) {
        throw error
    }
}




module.exports = { buildColumns, buildColumnType, addColumn }