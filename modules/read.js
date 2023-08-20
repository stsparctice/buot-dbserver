const { DBTypes } = require('../utils/types')
const { read, searchSQL, count } = require("../services/db/sql/sql-operation")
const { getDBConfig } = require('../modules/config/project.config')
const { getEntityConfigData } = require("./config/config")
const { getPrimaryKeyField, getTableAlias, getSqlQueryFromConfig, buildSqlCondition, getPKConnectionBetweenEntities , getLeftJoinBetweenEntities} = require('./config/config.sql')
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
        let n = { 0: 100 }
        if (condition&& condition.n) {
            n = { ...condition.n }
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
        const { entity, type } = getEntityConfigData({ project, entityName })
            if (type === DBTypes.SQL) {
                const primaryKey = getPrimaryKeyField(entity)
                console.log({ primaryKey })
                let n = { start:0, end: 1 }
                if (type === DBTypes.SQL) {
                    if (condition.key) {
                        condition[primaryKey] = condition.key
                        delete condition.key
                    }
                    console.log({ condition })
                    const items = await readSql(projectConfigUrl, project, entity, condition, n, entitiesFields)
                    return items
                }
            
        }

    }
    catch (error) {
        console.log({ error })
        throw error
    }
}


async function getValuesFromSQL(entity, n, condition, fields = [], joinToMainTable = undefined) {
   console.log({entity, condition, fields, joinToMainTable})
    const query = getSqlQueryFromConfig(entity, condition, fields, joinToMainTable);

    console.log({ query })
    const values = await read(query, n);
    return values
}


async function readSql(configUrl, project, entity, condition = {}, n, entitiesFields = []) {
    try {
        console.log({entitiesFields})
        if (entitiesFields.length > 0) {
            let items = []
            for (let entityFields of entitiesFields) {
                let values = []
                console.log({ entityFields })
                console.log(getTableAlias(entity))
                if (entityFields.entity !== getTableAlias(entity)) {
                    let entityName = entityFields.entity
                    const subEntity = getEntityConfigData({ project, entityName })
                    console.log({ subEntity })
                    const primaryKey = getPrimaryKeyField(subEntity.entity)
                    const connectEntitiesCondition = getPKConnectionBetweenEntities(entity, condition)
                    const subCondition = {connectEntitiesCondition}
                    n.end = n.start+50
                    n.orderBy=`${getTableAlias(subEntity.entity)}.${primaryKey}`
                    const joinToMainTable = getLeftJoinBetweenEntities(entity, subEntity.entity)
                    values = await getValuesFromSQL(subEntity.entity, n, subCondition, entityFields.fields, joinToMainTable)
                }
                if (entityFields.entity === getTableAlias(entity)) {
                    // let subCondition = entityFields.entity.condition
                    // if (!subCondition) {

                    // }
                    const primaryKey = getPrimaryKeyField(entity)
                    n.orderBy=`${getTableAlias(entity)}.${primaryKey}`
                    console.log('mainentity')
                    values = await getValuesFromSQL(entity, n, condition, entityFields.fields)
                }
                // items = [...items, ArrangeObjects(values)]
            }
            return items
        }
        else {
            const primaryKey = getPrimaryKeyField(entity)
            n.orderBy=`${getTableAlias(entity)}.${primaryKey}`
            values = await getValuesFromSQL(entity ,n, condition)
            const items = ArrangeObjects(values)
            return items
        }
    }
    catch (error) {
        throw error
    }
}

function ArrangeObjects(values) {
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
    ArrangeObjects,
    readSql,
    getCount
}
