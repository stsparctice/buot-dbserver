const { buildSqlCondition, getSqlTableColumnsType, buildOneTableSelectQuery } = require('./config.sql')
const { getPrimaryKeyField, getTableAlias } = require('./config')

const { read, update } = require('../../services/db/sql/sql-operation')

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
        const columns = getSqlTableColumnsType(entity)
        const objectKeys = Object.keys(object)
        const selectColumns = columns.filter(({ name }) => objectKeys.includes(name)).map(({sqlName})=>sqlName)
        const query = buildOneTableSelectQuery({ database, tablename: entity.MTDTable.entityName.sqlName, alias,columns:selectColumns, condition: sqlCondition })
        const response = await read(query)
        if (response.length === 1) {
            const data = response[0]
            const sqlKeys = Object.keys(data)
            const sqlData = sqlKeys.reduce((element, key) => {
                const col = columns.find(({ sqlName }) => sqlName === key)
                element[col.name] = data[col.sqlName]
                return element
            }, {})
            const updateKeys = objectKeys.filter(key => sqlData[key] != object[key])
            const updates = updateKeys.map(key => ({ key, oldValue: sqlData[key], newVal: object[key], update: entity.columns.find(({ name }) => name === key).update }))
            if (updates.length === 0) {
                return true
            }
            return { entity, updates, condition }

        }
        return false
    }
    catch (error) {
        console.log({ error })
        throw error
    }

}




module.exports = { compareObject, splitComplicatedObject }

