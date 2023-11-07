const { getPrimaryKeyField,
    buildSqlCondition, getTableAlias, getSqlTableColumnsType } = require('./config.sql')

const { buildOneTableSelectQuery, read } = require('../../services/db/sql/sql-operation')

function splitComplicatedObject(object, entityName = 'default') {

    const mainEntity = { entityName }
    const entityProps = Object.entries(object).filter(entry => typeof entry[1] !== 'object')
    mainEntity.value = Object.fromEntries(entityProps)
    let entityList = [mainEntity]
    for (const key in object) {
        if (typeof object[key] === 'object') {
            let obj = { entityName: key, value: object[key] }
            entityList = [...entityList, obj]
        }
    }
    return entityList
}

const compareObject = async function (database, entity, object, condition) {
    try {
        if (!condition) {
            const { name } = getPrimaryKeyField(entity)
            const pkValue = object[name]
            condition = {}
            condition[name] = pkValue
        }
        const sqlCondition = buildSqlCondition(entity, condition)
        const alias = getTableAlias(entity)
        const query = buildOneTableSelectQuery(database, entity.MTDTable.entityName.sqlName, alias, sqlCondition)
        const response = await read(query)
        console.log({response})
        if (response.length === 1) {
            const columns = getSqlTableColumnsType(entity)
            const data = response[0]
            const objectKeys = Object.keys(object)
            const sqlKeys = Object.keys(data)
            const sqlData = sqlKeys.reduce((element, key) => {
                const col = columns.find(({ sqlName }) => sqlName === key)
                element[col.name] = data[col.sqlName]
                return element
            }, {})
            const updateKeys = objectKeys.filter(key => sqlData[key] != object[key])
            const updates = updateKeys.map(key => ({ key, oldValue: sqlData[key], newVal: object[key] }))
            return {entity,updates, condition}

        }
        return false
    }
    catch (error) {
        throw error
    }

}




module.exports = { compareObject, splitComplicatedObject }

