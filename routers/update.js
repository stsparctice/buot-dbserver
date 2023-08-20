const express = require('express');
const router = require('express').Router()
const { startupdate } = require('../modules/update');

router.post('/updateOne', express.json(), async (req, res) => {
    try {
        let result = await startupdate({ project: res.project, entityName: req.body.entity, set: req.body.set, condition: req.body.condition })
        if (result)
            res.status(201).send({ "result": result })
        else {
            res.status(500).send(result)
        }
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

router.post('/updateMany', express.json(), async (req, res) => {
    try {
        let result = await startupdate({ project: res.project, entityName: req.body.entity, set: req.body.set, condition: req.body.condition })
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

module.exports = router
