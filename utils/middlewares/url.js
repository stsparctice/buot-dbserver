const getProject = ()=>{
    return (req, res, next)=>{
        const {hostname,port,baseUrl, url, body, params, originalUrl} = req
        console.log({hostname, port, url, body, params, originalUrl})
        res.project = originalUrl.split('/')[1]
        next()
    }
}

module.exports = {getProject}