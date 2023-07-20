const getProject = ()=>{
    return (req, res, next)=>{
        const {hostname,port,baseUrl, url, body, params, originalUrl} = req
        res.project = originalUrl.split('/')[1]
        next()
    }
}

module.exports = {getProject}