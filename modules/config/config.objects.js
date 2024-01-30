const { buildSqlCondition, getSqlTableColumnsType, buildOneTableSelectQuery } = require('./config.sql')
const { getPrimaryKeyField, getTableAlias, getForeignkeyBetweenEntities, getEntityConfigData } = require('./config')

const { read, update } = require('../../services/db/sql/sql-operation')
const { removeKeysFromObject } = require('../../utils/code/objects')

function splitComplicatedObject(project, object, entityName = 'default') {
    const mainEntity = { entityName }
    const mainEntityConfig = getEntityConfigData({ project, entityName })
    const entityProps = Object.entries(object).filter(entry => typeof entry[1] !== 'object' || entry[1] == null)
    mainEntity.value = Object.fromEntries(entityProps)
    let entityList = [mainEntity]
    object = removeKeysFromObject(object, Object.keys(mainEntity.value))
    for (const key in object) {
        if (Array.isArray(object[key])) {
            const subEntity = getEntityConfigData({ project, entityName: key })
            console.log({ mainEntity })
            let { name, foreignkey } = getForeignkeyBetweenEntities(mainEntityConfig, subEntity)
            console.log({ foreignkey });
            entityList = [...entityList, ...object[key].reduce((list, item) => {
                let value = { ...item };

                value[name] = mainEntity.value[foreignkey.ref_column_name]
                let obj = { entityName: key, value }
                return [...list, obj]
            }, [])]
        }
        else if (typeof object[key] === 'object' && typeof object[key] !== null) {
            let obj = { entityName: key, value: object[key] }
            entityList = [...entityList, obj]
        }

    }
    console.log(entityList)
    return entityList
}

const compareObject = async function (database, entity, object, condition) {
    try {
        const { name } = getPrimaryKeyField(entity)
        const checkExist = object[name] === undefined;
        if (checkExist) {
            condition = { ...object };
        }

        if (!condition) {
            const pkValue = object[name]
            condition = {}
            condition[name] = pkValue
        }
        console.log(entity.MTDTable.entityName)
        console.log({ object, condition });
        const sqlCondition = buildSqlCondition(entity, condition)
        const alias = getTableAlias(entity)
        const columns = getSqlTableColumnsType(entity)
        const objectKeys = Object.keys(object)
        const selectColumns = columns.filter(({ name }) => objectKeys.includes(name)).map(({ sqlName }) => sqlName)
        const query = buildOneTableSelectQuery({ database, tablename: entity.MTDTable.entityName.sqlName, alias, columns: selectColumns, condition: sqlCondition })
        const response = await read(query)
        if (checkExist) {
            if (response.length === 0)
            {
                const updates = Object.keys(condition).map(key => ({ key, oldValue: undefined, newVal: condition[key], update: "createnew" }))
                console.log({updates})
                return {entity, updates, condition:undefined}
            }
        }
        if (response.length === 1) {

            const data = response[0]
            const sqlKeys = Object.keys(data)
            const sqlData = sqlKeys.reduce((element, key) => {
                const col = columns.find(({ sqlName, update_copy }) => sqlName === key && update_copy)
                if (col) {
                    element[col.name] = data[col.sqlName]
                    return element
                }
                else
                    return {undefined}
            }, {})
            const updateKeys = objectKeys.filter(key => sqlData[key] && sqlData[key] != object[key])
            const updates = updateKeys.map(key => ({ key, oldValue: sqlData[key], newVal: object[key], update: entity.columns.find(({ name }) => name === key).update }))
            if (updates.length > 0) {
                return { entity, updates, condition }
            }

        }

        return false;

    }
    catch (error) {
        console.log({ error })
        throw error
    }

}




module.exports = { compareObject, splitComplicatedObject }

