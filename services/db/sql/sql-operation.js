const { getPool } = require('./sql-connection');
const { getTableFromConfig, parseSQLTypeForColumn, getPrimaryKeyField, getSqlTableColumnsType, parseSQLType } = require('../../../modules/config/config')
const { PreparedStatement, ConnectionPool } = require('mssql');
const sql = require('mssql');
const { createArrColumns } = require('../../../modules/functions');
const { SQL_PORT, SQL_SERVER, SQL_USERNAME, SQL_PASSWORD } = process.env

const create = async function (database, entity, columns, values) {
     try {
          let primarykey = getPrimaryKeyField(entity)
          const result = await getPool().request().query(`use ${database} INSERT INTO ${entity} (${columns}) VALUES ( ${values} ) ; SELECT @@IDENTITY ${primarykey}`);
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
// const teacher = {
//      entity: 'Teachers',
//      values: {
//           TeacherName: 'x', Phone: '1234', Email: 'gfhd',
//           TeachersPoolGenders: {
//                values: { GenderId: 1, teacherId: 888 }
//           },
//           TeacherSchedule: {

//           }

//      }
// }
// database: Bubble
// entity: teachers
// columns: [TeacherName,Phone,Email]
// values: ['x','1234','gfhd']
// tran: {
//        TeachersPoolGenders: { GenderId: 1, teacherId: 'teacherId' },
//        TeacherSchedule: {}
// }
const createTrac = async function ({ database, entity, columns, values, tran }) {
     try {
          console.log("____createTran", { database, entity, columns, values, tran });
          let primarykey = getPrimaryKeyField(entity)
          let connectionPool = new sql.ConnectionPool(poolConfig());
          await connectionPool.connect();

          //    const transaction: Transaction = new sql.Transaction(this.connectionPool);

          const transaction = new sql.Transaction(connectionPool);
          const tr = new sql.PreparedStatement(transaction);
          // tr.input('number', sql.Numeric(18, 0));
          try {
               await transaction.begin();
               console.log("_____________________");
               console.log("db:",database,"entity:",entity,"columns:",columns,"value:",values,"pk:",primarykey);
               let ans = await tr.prepare(`use ${database} INSERT INTO ${entity} (${columns}) VALUES ( ${values} ); SELECT @@IDENTITY ${primarykey}`);
               let id = await tr.execute();
               console.log({id});
               await tr.unprepare();
               id = Object.values(id.recordset[0])[0]
               for (const key in tran) {
                    console.log(key, "___key");
                    entity = key
                    Object.keys(tran[key]).map(t => {
                         console.log(t);
                         t == tran[key][t] ? tran[key][t] = id : null
                         // return t
                    })
                    console.log(tran[key], "tran[key]");
                    const types = getSqlTableColumnsType(entity)
                    primarykey = getPrimaryKeyField(entity)
                    columns = createArrColumns(Object.keys(tran[key])).join(',')
                    console.log(columns, "__co");
                    values = parseSQLType(tran[key], types).join(',')
                    console.log({ entity, columns, values, primarykey });

                    await tr.prepare(`use ${database} INSERT INTO tbl_${entity} (${columns}) VALUES ( ${values} ); SELECT @@IDENTITY `);
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
     }
     catch (error) {
          console.log({ error });
          throw error
     }
};

const read = async function (query = "", n) {
     try {
          const result = await getPool().request().query(`${query.trim()} ORDER BY ${Object.values(n)[1]} OFFSET (${Object.keys(n)[0]}) ROWS FETCH NEXT (${Object.values(n)[0]}) ROWS ONLY`);
          if (result.recordset)
               return result.recordset;
          return false
     }
     catch (error) {
          throw error
     }

};

const update = async function (database, entity, set, condition) {
     try {
          const alias = await getTableFromConfig(entity).MTDTable.collectionName.name
          const entries = Object.entries(set)
          const updateValues = entries.map(value => `${alias}.${value[0]}=${parseSQLTypeForColumn({ name: value[0], value: value[1] }, entity)}`).join(',')
          const result = await getPool().request().query(`use ${database} UPDATE ${alias} SET ${updateValues} FROM ${entity} AS ${alias} WHERE ${condition}`);
          if (result)
               return result;
          else
               return false;
     }
     catch (error) {
          throw error
     }

};

const innerJoin = async function (firstTableName, secondTableName, columns, on, condition, database = 'RapidMed') {
     const result = await getPool().request().query(`use ${database} SELECT ${columns} FROM ${firstTableName} INNER JOIN ${secondTableName} ON ${on} WHERE ${condition}`);
     return result.recordset;
};

const searchSQL = async function (entity, search) {
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

const count = async function (entityName, condition) {
     try {
          const result = await getPool().request().query(`SELECT count(*)  FROM ${entityName} where ${condition}`);
          if (result.recordset)
               return result.recordset;
          return false
     }
     catch (error) {
          throw error
     }

};



// let condition ={
//      CONTAINS:{value:'xl ft', fields:["FirstName", "LastName"]}
//  }



module.exports = {
     create,
     read,
     update,
     innerJoin,
     searchSQL,
     createTrac,
     count
};
