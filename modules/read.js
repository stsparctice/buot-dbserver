const { DBTypes } = require('../utils/types')
const { deleteKeysFromObject } = require('../utils/code/objects')
const { read, searchSQL, count } = require("../services/db/sql/sql-operation")
const { getDBConfig } = require('../modules/config/project.config')
const { getEntityConfigData } = require("./config/config")
const { getPrimaryKeyField, getTableAlias, getSqlQueryFromConfig, buildSqlCondition, getPKConnectionBetweenEntities, getLeftJoinBetweenEntities } = require('./config/config.sql')


// {
//     "entity":"teachers",
//     "condition":{
//         "id":3,
//          "n":{100:200}
//     }
// }
async function startReadMany({ project, entityName, condition }) {
    try {
        const projectConfigUrl = getDBConfig(project)
        const { entity, type } = getEntityConfigData({ project, entityName })
        console.log({ entity })
        let n = { start: 0, end: 100 }
        if (condition && condition.n) {
            n = { ...condition.n }
            condition = [condition].map(({ n, ...rest }) => rest)[0]
        }

        if (type === DBTypes.SQL) {
            if (Object.keys(condition).includes('CONTAINS')) {
                const answer = await searchSQL(projectConfigUrl, entity, condition.CONTAINS)
                return answer
            }
            console.log({ projectConfigUrl })
            const items = await readSql(projectConfigUrl, project, entity, condition, n)
            return items
        }
    }
    catch (error) {
        console.log({ error })
        throw error
    }
}

async function startReadOne({ project, entityName, condition, entitiesFields }) {
    try {
        const projectConfigUrl = getDBConfig(project)
        const { entity, type } = getEntityConfigData({ project, entityName })
        console.log({ entityName })
        console.log({ entity })
        if (type === DBTypes.SQL) {
            const primaryKey = getPrimaryKeyField(entity)
            console.log({ primaryKey })
            let n = { start: 0, end: 1 }
            if (type === DBTypes.SQL) {
                if (condition.key) {
                    condition[primaryKey] = condition.key
                    condition = deleteKeysFromObject(condition, [key])
                    // delete condition.key
                }
                console.log({ condition })
                const items = await readSql(projectConfigUrl, project, entity, condition, n, entitiesFields)
                return items[0]
            }

        }

    }
    catch (error) {
        console.log({ error })
        throw error
    }
}


// async function getValuesFromSQL(entity, n, condition, fields = [], joinToMainTable = undefined) {
//    console.log({entity, condition, fields, joinToMainTable})
//     const query = getSqlQueryFromConfig(entity, condition, fields, joinToMainTable);

async function getValuesFromSQL(configUrl, entity, n, condition, fields = [], joinToMainTable = undefined) {
    const query = getSqlQueryFromConfig(configUrl, entity, condition, fields, joinToMainTable);
    console.log({ query })
    const values = await read(query, n);
    return values
}


async function readSql(configUrl, project, entity, condition = {}, n, entitiesFields = []) {
    try {
        console.log({ entitiesFields })
        if (entitiesFields.length > 0) {
            let mainItem = { connections: [] }
            for (let entityFields of entitiesFields) {
                let values = []
                if (entityFields.entity !== getTableAlias(entity)) {
                    let entityName = entityFields.entity
                    const subEntity = getEntityConfigData({ project, entityName })
                    const primaryKey = getPrimaryKeyField(subEntity.entity)
                    const connectEntitiesCondition = getPKConnectionBetweenEntities(entity, condition)
                    const subCondition = { connectEntitiesCondition }
                    n.end = n.start + 50
                    n.orderBy = `${getTableAlias(subEntity.entity)}.${primaryKey}`
                    const joinToMainTable = getLeftJoinBetweenEntities(entity, subEntity.entity)
                    values = await getValuesFromSQL(configUrl, subEntity.entity, n, subCondition, entityFields.fields, joinToMainTable)
                    console.log(values[0])
                    const object = { entity: entityFields.entity, values: arrangeFKObjects(values) }

                    mainItem.connections.push(object)

                }
                if (entityFields.entity === getTableAlias(entity)) {
                    const primaryKey = getPrimaryKeyField(entity)
                    n.orderBy = `${getTableAlias(entity)}.${primaryKey}`

                    values = await getValuesFromSQL(configUrl, entity, n, condition, entityFields.fields)
                    mainItem = { entity: entityFields.entity, values: arrangeFKObjects(values), connections: mainItem.connections }
                }

            }
            console.log(mainItem)
            const mappedObject = mapConnetedObject(mainItem)
            return mappedObject
        }
        else {
            console.log({ project, entity })
            const primaryKey = getPrimaryKeyField(entity)
            n.orderBy = `${getTableAlias(entity)}.${primaryKey}`
            values = await getValuesFromSQL(configUrl, entity, n, condition)
            const items = arrangeFKObjects(values)
            return items
        }
    }
    catch (error) {
        throw error
    }
}

function arrangeFKObjects(values) {
    console.log({ values })
    const items = []
    for (let val of values) {
        const entries = Object.entries(val)
        const foreignkeys = entries.filter(e => e[0].startsWith('FK'))
        let groups = foreignkeys.reduce((gr, fk) => {
            const prop = fk[0].split('_')[1]
            if (!gr.some(g => g.name === prop)) {
                let group = { name: prop, values: [fk] }
                gr = [...gr, group]
            }
            else {
                gr.find(g => g.name === prop).values.push(fk)
            }
            return gr
        }, [])
        const newObj = entries.reduce((obj, ent) => {

            if (ent[0].startsWith('FK')) {
                console.log({ obj })
                return obj
            }
            // const gr = groups.find(g => g.name.indexOf(ent[0]) !== -1)
            const gr = groups.find(g => g.name.toLowerCase() === ent[0].toLowerCase())
            console.log({ gr, ent: ent[0] })
            if (gr) {
                obj[ent[0]] = gr.values.reduce((val, v) => {
                    const split = v[0].split('_')
                    val[split[split.length - 1]] = v[1]
                    return val
                }, {})
            }
            else {
                obj[ent[0]] = ent[1]
            }
            return obj
        }, {})
        items.push(newObj)
    }
    console.log({ items })

    return items;
}

function mapConnetedObject(item) {
    console.log('item')
    console.log(item)
    const { connections } = item
    for (let connection of connections) {
        const { entity, values } = connection
        console.log({ values })
        for (const val of values) {
            console.log({ val })
            const valEntries = Object.entries(val).filter(e => e[1].entity)
            const mappedValEntries = valEntries.map(e => ({ key: e[0], entity: e[1].entity, value: e[1] }))
            console.log({ mappedValEntries })
            mappedValEntries.forEach(va => {
                console.log({ va })
                if (item.entity === va.entity) {
                    console.log(item.values)
                    const en = item.values.find(v => v[va.key] === va.value[va.key])
                    console.log({ en })
                    val = deleteKeysFromObject(val, [va.key])
                    // delete val[va.key]
                    if (en[entity]) {
                        en[entity] = [...en[entity], val]
                    }
                    else {
                        en[entity] = [val]
                    }
                }
            })

        }
    }
    return item.values
}



async function getCount({ project, entityName, condition }) {
    try {

        const entity = getEntityConfigData({ project, entityName })
        const query = buildSimpleSqlCondition(condition)
        if (entity.type === DBTypes.SQL) {
            const items = await count(entity.entityName.sqlName, query)
            return items
        }
    }
    catch (error) {
        throw error
    }
}


module.exports = {
    startReadOne,
    startReadMany,
    arrangeFKObjects,
    readSql,
    getCount
}
