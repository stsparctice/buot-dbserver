const getProject = ()=>{
    return (req, res, next)=>{
        const {hostname,port,baseUrl, url, body, params, originalUrl} = req
        console.log({hostname,port,baseUrl,url,params, body})
        res.project = originalUrl.split('/')[1]
        console.log(res.project)
        next()
    }
}

module.exports = {getProject}