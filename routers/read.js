const express = require('express');
const router = require('express').Router()
const data = require('../data/data.json')
const { readSql } = require('../modules/read');

//שליחה בפרמס שם טבלה ותנאי בקווארי
router.get('/readMany/:entity', async (req, res) => {
    try {
        let n = 100
        let result = await readSql(req.params.entity, req.query, n)
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
router.post('/readMany', express.json(), async (req, res) => {
    try {
        let n = 100
        let ans = await readSql(req.body.entity, req.body.condition, n)
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
        let result = await readSql(req.params.entity, req.query)
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
router.post('/readOne', express.json(), async (req, res) => {
    try {
        let ans = await readSql(req.body.entity, req.body.condition)
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
        const result = await readSql(req.params.entity, condition)
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
