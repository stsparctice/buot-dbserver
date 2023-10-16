const { db } = require('./build-connection')
const { getPool } = require('./sql-connection')
const { getEntitiesFromConfig } = require('../../../modules/config/config')
const { getAllDBConfig } = require('../../../modules/config/project.config')
const { DBTypes } = require('../../../utils/types')
const { Promise } = require('mssql/lib/tedious')

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

async function createTables() {
    const list = getAllDBConfig()
    for (const dbConfig of list) {
        const sqlConfig = getEntitiesFromConfig(dbConfig).sql
        if (sqlConfig.length > 0) {
            for (const item of sqlConfig) {
                try {
                    _ = await getPool().request().query(`use master IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = '${item.dbName}') begin use master CREATE DATABASE [${item.dbName}]; end`);

                    for (const db of item.db) {
                        if (db.type === DBTypes.SQL) {
                            console.log({ db })
                            for (let table of db.collections) {
                                const response = await getPool().request().query(`use ${item.dbName} IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.MTDTable.entityName.sqlName}')
                    CREATE TABLE [dbo].[${table.MTDTable.entityName.sqlName}](${buildColumns(table.columns)})`);
                            }
                            //         Promise.all(db.collections.map(async table => {
                            //             _ = await getPool().request().query(`use ${item.dbName} IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.MTDTable.entityName.sqlName}')
                            // CREATE TABLE [dbo].[${table.MTDTable.entityName.sqlName}](${buildColumns(table.columns)})`);
                            //         }))
                        }


                        //         db.collections.forEach(async table => {
                        //             _ = await getPool().request().query(`use ${item.dbName} IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${table.MTDTable.entityName.sqlName}')
                        // CREATE TABLE [dbo].[${table.MTDTable.entityName.sqlName}](${buildColumns(table.columns)})`);
                        //         });
                    }
                    // });
                }
                catch (error) {
                    throw (error)
                }

            }
        }
    }
};

module.exports = { createTables };
