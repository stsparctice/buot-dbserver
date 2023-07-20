const projectConfig = require('../../data/projectConfig.json')

const getDBConfig = (projectUrl)=>{
    const projectMTD = projectConfig.find(pr=>pr.url===projectUrl)
    return projectMTD.dbConfigFile
}


module.exports = {getDBConfig}