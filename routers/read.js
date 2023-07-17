const express = require('express');
const router = require('express').Router()
const data = require('../data/data.json')
const { connectTables, readManyInQuery } = require('../modules/read');

//!
router.get('/readMany/:entity', async (req, res) => {
    try {
        console.log(req.params.entity,req.query,'req.params.entity,req.query');
        let result = await connectTables(req.params.entity,req.query)
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
//!
router.post('/readMany', express.json(), async (req, res) => {
    try {
        let ans = await connectTables(req.body.entity, req.body.condition)
        if (ans)
            res.status(201).send(ans)
        else
            res.status(500).send(ans)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})


router.get('/readOne', async (req, res) => {
    try {
        let result = await connectTables(req.query)
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

router.post('/readOne', express.json(), async (req, res) => {
    try {
        let ans = await connectTables(req.body)
        if (ans)
            res.status(201).send(ans)
        else
            res.status(500).send(ans)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

router.get('/readOne/:id', async (req, res) => {
    try {
        let ans = await connectTables(req.params)
        if (ans)
            res.status(201).send(ans)
        else
            res.status(500).send(ans)
    }
    catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router
