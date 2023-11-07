const express = require('express');
const router = require('express').Router()
const { startupdate, updateTranzaction } = require('../modules/update');


router.post('/updateOne', express.json(), async (req, res) => {
    try {
        console.log('update')
        let ans = await startupdate({ project: res.project, entityName: req.body.entity, data: req.body.data, condition: req.body.condition })
        if (ans) {
            res.status(204).send()
        }
        else {
            throw new Error('more rows were updated')
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).send(error.message)
    }
})

router.post('/updateMany', express.json(), async (req, res) => {
    try {
        let result = await startupdate({ project: res.project, entityName: req.body.entity, data: req.body.data, condition: req.body.condition })
        if (result)
            res.status(201).send(result)
        else {
            res.status(500).send(result)
        }
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

router.post('/updateTran', express.json(), async (req, res) => {
    try {
        console.log(res.project);
        const result = await updateTranzaction()
        console.log("result", result);
        if (result) {
            res.status(201).send({ result: result })
        }
        else {
            res.status(500).send(result)
        }
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


// router.post('/compare', express.json(),  async (req, res) => {
//     try {
//         console.log("in routerrrrrrrrrrrrrrrrr");
//         const result = await compareWithData(req.body)
//         if (result) {
//             res.status(201).send(result)
//         }
//         else {
//             res.status(500).send(result)
//         }
//     }
//     catch (error) {
//         res.status(500).send(error.message)
//     }
// })
module.exports = router
