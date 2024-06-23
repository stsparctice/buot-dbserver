const sql = require('mssql');
const { sqlKeyTypes } = require('../../../utils/types')
const { getPool } = require('./sql-connection');
const { buildInsertQuery,
     getTableColumns,
     buildSqlCondition,
     buildColumnsValuesPair,
     parseObjectValuesToSQLTypeObject } = require('../../../modules/config/config.sql')
const { getForeignkeyBetweenEntities, getEntityConfigData, getPrimaryKeyField, getTableAlias } = require('../../../modules/config/config');
const { SQL_PORT, SQL_SERVER, SQL_USERNAME, SQL_PASSWORD } = process.env


const create = async function (query) {
     try {
          const result = await getPool().request().query(query);
          if (result)
               return result;
          return 'no create';
     }
     catch (error) {
          throw error
     }
};
const poolConfig = () => ({
     driver: SQL_PORT,
     server: SQL_SERVER,
     database: 'master',
     user: SQL_USERNAME,
     password: SQL_PASSWORD,
     options: {
          encrypt: false,
          enableArithAbort: false
     }
});

const createTransaction = async function ({ project, entity,object, tran, trys }) {
     try {
          let id
          console.log({ entity })
          console.log({object})
          let primarykey = getPrimaryKeyField(entity.entity).sqlName
          const connectionPool = new sql.ConnectionPool(poolConfig());
          _ = await connectionPool.connect();

          const transaction = new sql.Transaction(connectionPool);
          const tr = new sql.PreparedStatement(transaction);
          try {
               await transaction.begin();
               let query = buildInsertQuery(entity.entity, object)
               _ = await tr.prepare(query);
               id = await tr.execute();
               await tr.unprepare();
               id = Object.values(id.recordset[0])[0]
               for (const connectEntity of tran) {
                    const subEntity = connectEntity.entity
                    const subEntityData = getEntityConfigData({ project, entityName: subEntity })
                    if (subEntityData) {
                         const types = getTableColumns(subEntityData)
                         primarykey = getPrimaryKeyField(subEntityData.entity).sqlName
                         const foreignKey = getForeignkeyBetweenEntities(entity, subEntityData)
                         const fullValues = connectEntity.values.map(item => {
                              item[foreignKey.name] = id
                              return item
                         })
                         for (const oneItem of fullValues) {
                              console.log({ oneItem })
                              query = buildInsertQuery(subEntityData.entity, oneItem)
                              await tr.prepare(query);
                              await tr.execute();
                              await tr.unprepare();
                         }
                    }
               }
               console.log('commit')
               await transaction.commit();


          } catch (error) {

               console.log({ error });
               await transaction.rollback();
               console.log('execution failed...');
          }
          console.log('done...');
          return id
     }
     catch (error) {
          console.log({ error });
          throw error
     }
};

const sqlTransaction = async function (queries) {
     let responses =[]
     try {
          let connectionPool = new sql.ConnectionPool(poolConfig());
          await connectionPool.connect();
          const transaction = new sql.Transaction(connectionPool);
          const tr = new sql.PreparedStatement(transaction);
          try {
               await transaction.begin();
               for(const command of queries){
                    await tr.prepare(command)
                    try {
                        responses = [...responses,{command, response: (await tr.execute()).recordset}]
                    }
                    finally {
                         await tr.unprepare()
                    }
               }
               await transaction.commit();
               return responses

          } catch (error) {
               console.log({ error });
               await transaction.rollback();
          }
     }
     catch (error) {
          console.log({ error });
          throw error
     }
};

const read = async function (query = "", n) {
     console.log({query});
     try {
          if (n) {
               query = `${query.trim()} ORDER BY ${n.orderBy} OFFSET (${n.start}) ROWS FETCH NEXT (${n.end}) ROWS ONLY`
          }
          const result = await getPool().request().query(query);
          console.log(result)
          if (result.recordset)
               return result.recordset;
          return false
     }
     catch (error) {
          throw error
     }

};



const update = async function (query) {
     try {
          const result = await getPool().request().query(query);
          if (result.rowsAffected.length > 0 && result.rowsAffected[0] > 0) {
               return { rowsAffected: result.rowsAffected[0] }
          }

          else
               return false;
     }
     catch (error) {
          console.log({ error })
          throw error
     }

};

const innerJoin = async function (firstTableName, secondTableName, columns, on, condition, database = 'RapidMed') {
     const result = await getPool().request().query(`use ${database} SELECT ${columns} FROM ${firstTableName} INNER JOIN ${secondTableName} ON ${on} WHERE ${condition}`);
     return result.recordset;
};

const searchSQL = async function (config, entity, search) {
     let select = ''
     if (search.fields.length > 0) {
          _ = search.fields.forEach(field => {
               select += `${field} +' '+ `
          })
          select = select.slice(0, select.length - 6);
     }
     else {
          select = search.fields[0]
     }
     const view = await buildView(entity, select)
     const values = search.value.split(' ')
     let str = `select * from SearchView where `
     values.forEach(v => {
          str += `combination like '%${v}%' and `
     });
     str = str.slice(0, str.length - 4);
     const result = await getPool().request().query(str)

     const result2 = await getPool().request().query(` DROP VIEW SearchView`)
}

const buildView = async function (entityName, select) {
     try {
          const result = await getPool().request().query(`CREATE VIEW SearchView AS SELECT *,  ${select} AS combination FROM Bubble.dbo.${entityName}`)
          if (result) {
               return result
          }
          return false
     }
     catch (error) {
          throw error
     }
}

const count = async function (entityName, dbname = "Bubble", condition = "1=1") {
     try {
          const query = `use ${dbname} SELECT count(*) count  FROM ${entityName} where ${condition}`
          console.log({ query })
          const result = await getPool().request().query(query);
          if (result.recordset)
               return result.recordset;
          return false
     }
     catch (error) {
          throw error
     }

};

const getSqlColumns = async function (database, tablename) {
     try {
          const response = await getPool().request().query(`USE master  SELECT COLUMN_NAME name,DATA_TYPE type, CHARACTER_MAXIMUM_LENGTH max, IS_NULLABLE isnull from ${database}.[INFORMATION_SCHEMA].[COLUMNS]  WHERE TABLE_NAME = N'${tablename}'`)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}

const getTableKeys = async function (database, tablename, key) {
     try {
          const response = await getPool().request().query(`USE master  SELECT  keys.COLUMN_NAME name , constrains.CONSTRAINT_TYPE  type 
     FROM ${database}.INFORMATION_SCHEMA.TABLE_CONSTRAINTS  constrains 
     INNER JOIN ${database}.INFORMATION_SCHEMA.KEY_COLUMN_USAGE  keys
     ON keys.CONSTRAINT_NAME = constrains.CONSTRAINT_NAME
     WHERE keys.TABLE_NAME = '${tablename}' AND CONSTRAINT_TYPE = '${key}'`)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}

const getIdentityColumns = async function (database, tablename) {
     try {
          const response = await getPool().request().query(`use master select columns.name
                                                            from ${database}.sys.columns columns
                                                            join  ${database}.sys.objects objects on columns.object_id = objects.object_id
                                                            join  ${database}.sys.schemas s on s.schema_id = objects.schema_id
                                                            where s.name = 'dbo'
                                                            and objects.is_ms_shipped = 0 and objects.type = 'U'
                                                            and columns.is_identity = 1
                                                            and objects.name = '${tablename}' `)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}

const getForeignKeysData = async function (database, tablename) {
     try {
          const response = await getPool().request().query(`use master  SELECT  
                                                    col1.name AS [column],
                                                    tab2.name AS [ref_table],
                                                    col2.name AS [ref_column]
                                                    FROM  ${database}.sys.foreign_key_columns fkc
                                                    INNER JOIN  ${database}.sys.objects obj
                                                    ON obj.object_id = fkc.constraint_object_id
                                                    INNER JOIN  ${database}.sys.tables tab1
                                                    ON tab1.object_id = fkc.parent_object_id
                                                    INNER JOIN  ${database}.sys.schemas sch
                                                    ON tab1.schema_id = sch.schema_id
                                                    INNER JOIN  ${database}.sys.columns col1
                                                    ON col1.column_id = parent_column_id AND col1.object_id = tab1.object_id
                                                    INNER JOIN  ${database}.sys.tables tab2
                                                    ON tab2.object_id = fkc.referenced_object_id
                                                    INNER JOIN  ${database}.sys.columns col2
                                                    ON col2.column_id = referenced_column_id AND col2.object_id = tab2.object_id
	                                                WHERE tab1.name  = N'${tablename}'`)
          return response.recordset
     }
     catch (error) {
          throw error
     }
}

// let condition ={
//      CONTAINS:{value:'xl ft', fields:["FirstName", "LastName"]}
//  }




module.exports = {
     sqlKeyTypes,
     create,
     read,
     update,
     innerJoin,
     searchSQL,
     createTransaction,
     sqlTransaction,
     count,
     getSqlColumns,
     getTableKeys,
     getIdentityColumns,
     getForeignKeysData,
};
