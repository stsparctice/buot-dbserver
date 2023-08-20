const express = require('express')
const router = express.Router()
const config  = require('./config.json')
const {getExampleByEntity} = require('./modules/readDataConfig')
const {createpath,createrouter,createpathName,createAllObj,createFunctionsbyRouterPage} = require('./modules/functions')
// const { readFile } = require('../modules/readfile')
const path = require('path')

router.get('/readsapi/:name', async (req, res) => {
    console.log("params",req.params.name);
console.log("ccccccccccc",config.document)
    try {

        const filepath = path.join(__dirname, '../app.js') 
        console.log("filePathhhhhhhhhhhhhhhhhh",filepath);
           // const response =await readFile(req.params.filename)
        const ans = await createAllObj(filepath,req.params.name);
        // const ans = await createAllObj(filepath,req.params.name);

        // let name='Teachers'
        // const a = getExampleByEntity(name)
        // const ans = await createFunctionsbyRouterPage()
        // const response = await readFile(filepath)
        // console.log(response,"response");
        // if (response) {
        //     response.forEach(r => {
        //         r.apiRequests.forEach(a => {
        //             console.log(a.arguments)
        //         })
        //     })
            res.status(201).send(ans)
        // }
        // else {
        //     res.status(500).send(response)
        // }
    } catch (error) {
        res.status(500).send(error.message)
    }
})
router.get('/getExample/:action/:nameEntity',async(req,res)=>{

    console.log(req.params.nameEntity)
    console.log("jjjjjjjjjjjjjjjjjjjjjj",req.params.action)

    try{
        const ans = await getExampleByEntity(req.params.action,req.params.nameEntity)
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

