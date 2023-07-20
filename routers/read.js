const express = require('express');
const router = require('express').Router()
const data = require('../data/data.json');
const { startRead } = require('../modules/read');

//שליחה בפרמס שם טבלה ותנאי בקווארי
router.get('/readMany/:entity', async (req, res) => {
    try {
        let result = await startRead({ project: res.project, entityName: req.params.entity, condition: req.query })
        if (result) {
            res.status(201).send(result)
        }
        else {
            res.status(500).send(result)
        }
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

//שליחה בבודי שם טבלה ותנאי באוביקט
router.post('/readMany/:entity', express.json(), async (req, res) => {
    try {
        let ans = await startRead({ project: res.project, entityName: req.params.entity, condition: req.body.condition })
        if (ans)
            res.status(201).send(ans)
        else
            res.status(500).send(ans)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

//שליחה בפרמס שם טבלה ותנאי בקווארי
router.get('/readOne/:entity', async (req, res) => {
    try {

        let result = await startRead({ project: res.project, entityName: req.params.entity, condition: { ...req.query, n: 1 } })
        if (result) {
            res.status(201).send(result)
        }
        else {
            res.status(500).send(result)
        }
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

//שליחה בבודי שם טבלה ותנאי באוביקט
router.post('/readOne/:entity', express.json(), async (req, res) => {
    try {
        let ans = await startRead({ project: res.project, entityName: req.params.entity, condition: { ...req.body.condition, n: 1 } })
        if (ans)
            res.status(201).send(ans)
        else
            res.status(500).send(ans)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

//שליחה בפרמס שם טבלה ואידי רצוי
router.get('/readOne/:entity/:id', async (req, res) => {

    try {
        let condition = { Id: req.params.id }
        let result = await startRead({ project: res.project, entityName: req.params.entity, condition: { ...condition, n: 1 } })
        if (result) {
            res.status(201).send({ "result": result })
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
