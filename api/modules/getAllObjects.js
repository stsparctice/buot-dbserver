
const config = require('../../data/waiting-list.json')
const projectConfig = require('../../data/projectConfig.json')
function getProjectConfig(project) {

    let config = projectConfig.find(e =>
        e.url == project
    )
    return config
}

function getObject(project, entity)
{
    const config = getProjectConfig(project)
    let result = {}
    result[entity] = getAllObjectByEntities(config, entity, {})
    return result;
}

function getAllObjectByEntities(project, entity, obj) {
    let collections = config[0].db[0].collections
    let entityData = collections.find(e =>
        e.MTDTable.entityName.name.toLocaleLowerCase() == entity.toLocaleLowerCase()
    )
    let columns = entityData.columns
    columns.forEach(col =>
        obj[col.name] = col.type.type
    )
    let connectedEntities = project.connected_entities.find(ce =>
        ce.entity == entity)
    const { subEntities } = connectedEntities

    for (let i = 0; i < subEntities.length; i++) {
        obj[subEntities[i]] = []
        const newObject = getAllObjectByEntities(project, subEntities[i], {})
        obj[subEntities[i]].push(newObject)
    }
    return obj
}

module.exports = { getAllObjectByEntities, getProjectConfig , getObject}