const express = require('express');
const router = require('express').Router()
const data = require('../data/data.json')
const { updateOneSQL, updateMenySql } = require('../modules/update');

router.post('/deleteMany', express.json(), async (req, res) => {
    try {
        result = await updateMenySql(req.body)
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

router.post('/deleteOne', express.json(), async (req, res) => {
    try {
        result = await updateOneSQL(req.body)
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
