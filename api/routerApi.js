const express = require('express')
const router = express.Router()
const config = require('./config.json')
const { getExampleByEntity } = require('./modules/readDataConfig')
const { createpath, createrouter, createpathName, createAllObj, createFunctionsbyRouterPage } = require('./modules/functions')
// const { readFile } = require('../modules/readfile')
const path = require('path')

router.get('/readsapi/:name', async (req, res) => {
    console.log("params", req.params.name);
    console.log("ccccccccccc", config.document)
    try {

        const filepath = path.join(__dirname, '../app.js')
        console.log("filePathhhhhhhhhhhhhhhhhh", filepath);
        const ans = await createAllObj(filepath, req.params.name);
        res.status(201).send(ans)
    } catch (error) {
        res.status(500).send(error.message)
    }
})
router.get('/getExample/:action/:nameEntity', async (req, res) => {

    console.log(req.params.nameEntity)
    console.log("jjjjjjjjjjjjjjjjjjjjjj", req.params.action)

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
        // const ans = await getOllObjectByEntitys(req.params.entity)
        ans = 3
        res.status(201).send(ans)

    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router

 // http://127.0.0.1:3485/wl/update_db/updateOne
        // {
        //     "entity":"Teachers",
        //     "set":{"TeacherName":"elki"},
        //     "condition":{"id":11}
        //     }

