const sql = require('mssql');
const { getPool } = require('./sql-connection');
const { getPrimaryKeyField, parseObjectValuesToSQLTypeArray, getTableColumns, parseObjectValuesToSQLTypeObject, getTableAlias, getTableName, getSqlTableColumnsType, getTableFromConfig } = require('../../../modules/config/config.sql')
const {types} = require('../../../modules/config/config.objects')
const { getForeignkeyBetweenEntities } = require('../../../modules/config/config');
const { getEntityConfigData } = require('../../../modules/config/config');
const { SQL_PORT, SQL_SERVER, SQL_USERNAME, SQL_PASSWORD } = process.env

const sqlKeyTypes = {
     PRIMARY_KEY: 'PRIMARY KEY',
     FOREIGN_KEY: 'FOREIGN KEY',
     UNIQUE: 'UNIQUE'
}

function buildColumnsValuesPair(object, columns) {

  
     console.log({ object })
     console.log({columns})
     const pairs = { columns: [], values: [] }

     for (let key in object) {
          const column = columns.find(({ name }) => name === key)
          pairs.columns.push(`[${column.sqlName}]`)
          const parse = types[column.type]
          pairs.values.push(parse.parseNodeTypeToSqlType(object[key]))
     }
     console.log({ pairs })
     return pairs
}


const create = async function (entity, columns, values) {
     try {
          let primarykey = getPrimaryKeyField(entity).sqlName

          const result = await getPool().request().query(`use ${entity.dbName} INSERT INTO ${entity.MTDTable.entityName.sqlName} (${columns}) VALUES ( ${values} ) ; SELECT @@IDENTITY ${primarykey}`);
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

const createTrac = async function ({ project, database, entity, columns, values, tran, trys }) {
     try {
          let id
          let table = getTableFromConfig(entity)
          // let primarykey = getPrimaryKeyField(trys.entity).sqlName
          let primarykey = getPrimaryKeyField(table).sqlName
          let connectionPool = new sql.ConnectionPool(poolConfig());
          await connectionPool.connect();

          const transaction = new sql.Transaction(connectionPool);
          const tr = new sql.PreparedStatement(transaction);
          try {
               await transaction.begin();
               const query = `use ${database} INSERT INTO ${entity} (${columns}) VALUES ( ${values} ); SELECT @@IDENTITY ${primarykey}`
               console.log({ query })
               _ = await tr.prepare(query);
               id = await tr.execute();
               await tr.unprepare();
               id = Object.values(id.recordset[0])[0]
               for (const connectEntity of tran) {
                    const subEntity = connectEntity.entity
                    table = getTableFromConfig(subEntity)
                    const types = getTableColumns(table)
                    primarykey = getPrimaryKeyField(table).sqlName
                    const foreignKey = getForeignkeyBetweenEntities(project, entity, subEntity)
                    const fullValues = connectEntity.values.map(item => {
                         item[foreignKey.name] = id
                         return item
                    })
                    console.log(fullValues)
                 
                    // const pair = buildColumnsValuesPair(table.columns.filter(({ primarykey }) => primarykey === undefined).map(({ sqlName }) => sqlName))
                    const pairs = fullValues.map(item => buildColumnsValuesPair(item, types))
                    console.log({ pairs })
                    // values = fullValues.map(val => parseObjectValuesToSQLTypeArray(val, types).join(','))
                    console.log({ subEntity, pairs, primarykey });
                    for (const oneItem of pairs) {
                         console.log({ oneItem })
                         await tr.prepare(`use ${database} INSERT INTO ${table.MTDTable.entityName.sqlName} (${oneItem.columns.join()}) VALUES ( ${oneItem.values.join()} ); SELECT @@IDENTITY `);
                         await tr.execute();
                         await tr.unprepare();
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
          await transaction.rollback();
          console.log({ error });
          throw error
     }
};

const createGlobalTran = async function ({ database, entity, alias, id, set }) {
     //use ${database} UPDATE ${alias} SET ${updateValues} FROM ${tablename} AS ${alias} WHERE ${condition}
     try {
          let id
          let table = getTableFromConfig(entity)
          let primarykey = getPrimaryKeyField(table).sqlName
          let connectionPool = new sql.ConnectionPool(poolConfig());
          await connectionPool.connect();

          //    const transaction: Transaction = new sql.Transaction(this.connectionPool);

          const transaction = new sql.Transaction(connectionPool);
          const tr = new sql.PreparedStatement(transaction);
          // tr.input('number', sql.Numeric(18, 0));
          try {
               await transaction.begin();
               console.log("_____________________");
               let ans = await tr.prepare(`use ${database} update ${alias} set ${updateName} from ${entity} as ${alias} where ${condition}`);
               id = await tr.execute();
               await tr.unprepare();
               id = Object.values(id.recordset[0])[0]
               for (const key in tran) {
                    console.log(key, "___key");
                    entity = key
                    console.log(tran[key], 'tran[key]');
                    Object.values(tran[key]).map(t => {
                         t == tran[key][t] ? tran[key][t] = id : null
                         // return t
                    })
                    console.log(tran[key], "tran[key]");
                    const types = getSqlTableColumnsType(entity)
                    table = getTableFromConfig(entity)/////
                    primarykey = getPrimaryKeyField(table).sqlName
                    columns = createArrColumns(Object.keys(tran[key])).join(',')
                    console.log(columns, "__co");
                    values = parseObjectValuesToSQLTypeArray(tran[key], types).join(',')
                    console.log({ entity, columns, values, primarykey });
                    await tr.prepare(query);
                    await tr.execute();
                    await tr.unprepare();
               }

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

const read = async function (query = "", n) {
     try {
          console.log({ n })
          console.log({ query: `${query.trim()} ORDER BY ${n.orderBy} OFFSET (${n.start}) ROWS FETCH NEXT (${n.end}) ROWS ONLY` })
          const result = await getPool().request().query(`${query.trim()} ORDER BY ${n.orderBy} OFFSET (${n.start}) ROWS FETCH NEXT (${n.end}) ROWS ONLY`);
          if (result.recordset)
               return result.recordset;
          return false
     }
     catch (error) {
          throw error
     }

};

const update = async function (database, { tablename, alias }, updateValues, condition) {
     try {
          if (!alias) {
               alias = tablename
          }
          const query = `use ${database} UPDATE ${alias} SET ${updateValues} FROM ${tablename} AS ${alias} WHERE ${condition}`
          console.log({ query })
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

const compareObject = async function (obj) {
     try {
          const entity = getEntityConfigData({ project: 'wl', entityName: obj.entityName })
          const response = await getPool().request().query(`USE Bubble SELECT * FROM ${entity.entity.MTDTable.entityName.sqlName} WHERE id=${obj.values.id}`)
          console.log(response);
          let newObj=[]
          let element
          console.log( Object.values(response.recordset[0]));
          Object.values(response.recordset[0]).forEach((val,i) => {
               console.log(val,'val');
               if (val != Object.values(obj.values)[i]) {
                    element={name:Object.keys(obj.values)[i],oldVal:val,newVal:Object.values(obj.values)[i]}
                    newObj.push(element)
               }
          });
          console.log(newObj);
          return newObj
     }
     catch (error) {
          throw error
     }

}


module.exports = {
     sqlKeyTypes,
     create,
     read,
     update,
     innerJoin,
     searchSQL,
     createTrac,
     buildColumnsValuesPair,
     createGlobalTran,
     count,
     getSqlColumns,
     getTableKeys,
     getIdentityColumns,
     getForeignKeysData,
     compareObject

};
