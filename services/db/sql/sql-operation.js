const { getPool } = require('./sql-connection');
const { getTableFromConfig, parseSQLTypeForColumn, getPrimaryKeyField } = require('../../../modules/config/config')

const create = async function (database, entity, columns, values) {
     try {
          let primarykey = getPrimaryKeyField(entity)
          const result = await getPool().request().query(`use ${database} INSERT INTO ${entity} (${columns}) VALUES ( ${values} ) ; select @@IDENTITY ${primarykey}`);
          if (result)
               return result;
          return 'no create';
     }
     catch (error) {
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
     count
};
