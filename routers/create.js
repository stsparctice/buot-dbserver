const express = require('express');
const router = require('express').Router()
const data = require('../data/data.json')
const { createOneSQL, createManySQL } = require('../modules/create');

router.post('/createOne', express.json(), async (req, res) => {
    try {
        const result = await createOneSQL(req.body)
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

router.post('/createMany', express.json(), async (req, res) => {
    try {
        const result = await createManySQL(req.body)
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
