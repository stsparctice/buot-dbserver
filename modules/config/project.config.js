const projectConfig = require('../../data/projectConfig.json')

const getDBConfig = (projectUrl)=>{
    const projectMTD = projectConfig.find(pr=>pr.url===projectUrl)
    return projectMTD.dbConfigFile
}

const getAllDBConfig = ()=>{
    const dbConfigList = projectConfig.map(({dbConfigFile})=>dbConfigFile)
    return dbConfigList
}


module.exports = {getDBConfig, getAllDBConfig}


function buildJoinAndSelect2(extra){
    function getSelectedColumns(myTable, entityFields) {
        const { entity, fields } = entityFields
        console.log({ entity, fields })
        const selectColumns = myTable.columns.filter(col => fields.includes(col.name))
        console.log({ selectColumns })
        return selectColumns
    
    }
    
    function getJoinColumn(myTable, joinTable) {
        console.log({ myTable, joinTable })
        const allForeignKeys = joinTable.columns.filter(col => col.type.includes('FOREIGN KEY'))
        const foreignkey = allForeignKeys.find(col => col.type.includes(myTable.MTDTable.collectionName.sqlName))
        console.log(foreignkey)
        return foreignkey
    }

    const myTable = getTableFromConfig(configUrl, tableName)
    const tableAlias = getTableAlias(configUrl, tableName)
    // const columns = myTable.columns.filter(({ type }) => type.toLowerCase().includes('foreign key'));
    // let columnsSelect = [{ tableName: myTable.MTDTable.collectionName.name, columnsName: [...myTable.columns.map(({ sqlName, name }) => ({ sqlName, name }))] }];
    let selectColumns = []
    if (entitiesFields) {
        console.log({ entitiesFields, tableName })
        const mainSelectedEntity = entitiesFields.find(e => e.entity.toLowerCase() === tableName.toLowerCase())
        if (mainSelectedEntity) {
            let cols = getSelectedColumns(myTable, mainSelectedEntity)
            selectColumns = [...cols.map(({ sqlName, name }) => ({ sqlName, name , alias:tableAlias}))]
        }
    }
    else {
        selectColumns = [...myTable.columns.map(({ sqlName, name }) => ({ sqlName, name }))]
    }
    let join = `${myTable.MTDTable.collectionName.sqlName} ${myTable.MTDTable.collectionName.name}`;
    entitiesFields.filter(ef => ef.entity.toLowerCase() !== tableName).forEach(
        ({ entity, fields }) => {
            const joinTable = getTableFromConfig(configUrl, entity)
          const joinColumn =   getJoinColumn(myTable, joinTable)
          const joinAlias = getTableAlias(configUrl, entity)
          let cols = getSelectedColumns(joinTable, fields)
          selectColumns = [...selectColumns,...cols.map(({ sqlName, name }) => ({ sqlName, name , alias:joinAlias}))] 
          join = `${join} LEFT JOIN ${tableToJoin} ${joinAlias} ON ${tableAlias}.${column.sqlName}=${alias}.${columnToJoin}`;

        }
    )
    // columns.forEach(column => {
    //     const tableToJoin = column.type.slice(column.type.lastIndexOf('tbl_'), column.type.lastIndexOf('('));
    //     const columnToJoin = column.type.slice(column.type.lastIndexOf('(') + 1, column.type.lastIndexOf(')'));
    //     const thisTable = getTableFromConfig(configUrl, tableToJoin);
    //     const alias = thisTable.MTDTable.collectionName.name;
    //     columnsSelect = [...selectColumns, { tableName: alias, columnsName: [`${columnToJoin} as FK_${column.name}_${columnToJoin}`, `${thisTable.MTDTable.defaultColumn} as FK_${column.name}_${thisTable.MTDTable.defaultColumn}`] }];
    //     join = `${join} LEFT JOIN ${tableToJoin} ${alias} ON ${myTable.MTDTable.collectionName.name}.${column.sqlName}=${alias}.${columnToJoin}`;
    // });

    let select = selectColumns.map(({alias, sqlName, name}) => `${alias}.${sqlName} as ${name}`);

    select = select.join(', ');

    return `SELECT ${select} FROM ${join}`
    
}


