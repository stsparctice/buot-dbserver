const projectConfig = require('../../data/projectConfig.json')

const getDBConfig = (projectUrl)=>{
    const projectMTD = projectConfig.find(pr=>pr.url===projectUrl)
    return projectMTD.dbConfigFile
}

const getAllDBConfig = ()=>{
    const dbConfigList = projectConfig.map(item=>item.dbConfigFile)
    return dbConfigList
}


module.exports = {getDBConfig, getAllDBConfig}