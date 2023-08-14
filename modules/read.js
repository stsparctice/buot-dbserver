const { DBTypes } = require('../utils/types')
const { read, searchSQL, count } = require("../services/db/sql/sql-operation")
const { getDBConfig } = require('../modules/config/project.config')
const { getSqlQueryFromConfig, buildSqlCondition, getPrimaryKeyField, getTableAlias, getTableFromConfig } = require("./config/config")

const { getEntityConfigData } = require('./functions')

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
        const entity = getEntityConfigData({ project, entityName })
        console.log({ entity })
        let n = { 0: 100, otderBy: `${entity.collectionName.name}.Id` }
        if (condition.n) {
            n = { ...condition.n, otderBy: `${entity.collectionName.name}.Id` }
            condition = [condition].map(({ n, ...rest }) => rest)[0]
        }

        if (entity.type === DBTypes.SQL) {
            if (Object.keys(condition).includes('CONTAINS')) {
                const answer = await searchSQL(projectConfigUrl, entity, condition.CONTAINS)
                return answer
            }
            console.log({ projectConfigUrl })
            const items = await readSql(projectConfigUrl, entity, condition, n)
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
        const entity = getEntityConfigData({ project, entityName })
        const primaryKey = getPrimaryKeyField(projectConfigUrl, entityName)
        console.log({ primaryKey })
        const alias = getTableAlias(projectConfigUrl, entityName)
        let n = { 0: 1, otderBy: `${alias}.${primaryKey}` }
        if (entity.type === DBTypes.SQL) {
            if (condition.key) {
                condition[primaryKey] = condition.key
                delete condition.key
            }
            console.log({ condition })
            const items = await readSql(projectConfigUrl, project, entity, condition, n, entitiesFields)
            return items
        }
    }
    catch (error) {
        console.log({ error })
        throw error
    }
}


async function getValuesFromSQL(configUrl, entity, n, condition, fields = []) {
    const query = getSqlQueryFromConfig(configUrl, entity, condition, fields);
    const values = await read(query, n);
    return values
}


async function readSql(configUrl, project,entity, condition = {}, n, entitiesFields = []) {
    try {
        if (entitiesFields.length > 0) {
            console.log({entitiesFields})
            let items = []
            for (let entityFields of entitiesFields) {
                let values = []
                console.log({entityFields})
                if (entityFields.entity !== entity.collectionName.name) {
                    let entityName=  entityFields.entity
                    const subEntity = getEntityConfigData({project,entityName})
                    console.log({ subEntity })
                    values = await getValuesFromSQL(configUrl, subEntity, n, {}, entityFields.fields)

                }
                if (entityFields.entity === entity.collectionName.name) {
                    values = await getValuesFromSQL(configUrl, entity, n, condition, entityFields.fields)

                }
                items = [...items, ArrangeObjects(values)]
            }
            return items
        }
        else {
            values = await getValuesFromSQL(configUrl, entity, n, condition)
            const items = ArrangeObjects(values)
            return items
        }
    }
    catch (error) {
        throw error
    }
}

async function ArrangeObjects(values) {
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
                return obj
            }
            // const gr = groups.find(g => g.name.indexOf(ent[0]) !== -1)
            const gr = groups.find(g => g.name.toLowerCase() === ent[0].toLowerCase())
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
    return items;
}


async function getCount({ project, entityName, condition }) {
    try {

        const entity = getEntityConfigData({ project, entityName })
        const query = buildSimpleSqlCondition(condition)
        if (entity.type === DBTypes.SQL) {
            const items = await count(entity.collectionName.sqlName, query)
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
    ArrangeObjects,
    readSql,
    getCount
}
