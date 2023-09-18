const express = require('express');
const router = require('express').Router()
const { startCreate, createTranzaction } = require('../modules/create');

router.post('/createOne', express.json(), async (req, res) => {
    try {
        const result = await startCreate({ project: res.project, entityName: req.body.entity, values: req.body.values })
        if (result) {
            res.status(201).send(result.recordset)
        }
        else {
            res.status(500).send(result)
        }
    }
    catch (error) {
        console.log({error})
        res.status(500).send(error.message)
    }
})

router.post('/createMany', express.json(), async (req, res) => {
    try {
        const result = await startCreate({ project: res.project, entityName: req.body.entity, values: req.body.values })
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

router.post('/createTran', express.json(), async (req, res) => {
    try {
        console.log(res.project);
        const result = await createTranzaction({ project: res.project, entityName: req.body.entity, value: req.body.values })
        console.log("result",result);
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
module.exports = router







