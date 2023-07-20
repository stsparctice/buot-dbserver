const express = require('express');
const router = require('express').Router()
const data = require('../data/data.json')
const { startupdate } = require('../modules/update');

router.post('/deleteMany', express.json(), async (req, res) => {
    try {
        result = await startupdate({project:res.project,entityName:req.body.entity,set:{...req.body.set,Disabled:1},condition:req.body.condition})
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
        result = await startupdate({project:res.project,entityName:req.body.entity,set:{...req.body.set,Disabled:1},condition:req.body.condition})
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
