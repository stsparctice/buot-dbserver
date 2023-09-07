const express = require('express')
const router = express.Router()
const config = require('./config.json')
const { getExampleByEntity } = require('./modules/readDataConfig')
const { createpath, createrouter, createpathName, createAllObj, createFunctionsbyRouterPage } = require('./modules/functions')
const {getOllObjectByEntitys}  = require ('./modules/getOllObjects')
// const { readFile } = require('../modules/readfile')
const path = require('path')

router.get('/readsapi/:name', async (req, res) => {
   
    try {

        const filepath = path.join(__dirname, '../app.js')    // const response =await readFile(req.params.filename)
        const ans = await createAllObj(filepath,req.params.name);
            res.status(201).send(ans)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
router.get('/getExample/:action/:nameEntity', async (req, res) => {
    try {
        const ans = await getExampleByEntity(req.params.action, req.params.nameEntity)
        res.status(201).send(ans)

    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/getOllObjectByEntitys/:entity',async (req,res)=>{
    try {
        const ans = await getOllObjectByEntitys(req.params.entity)
        
        res.status(201).send(ans)

    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router