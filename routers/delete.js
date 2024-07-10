const express = require('express');
const router = require('express').Router()
const { startupdate } = require('../modules/update');
const { startDeleteItem } = require('../modules/delete');

router.post('/deleteMany', express.json(), async (req, res) => {
    try {
        const result = await startupdate({ project: res.project, entityName: req.body.entity, data: { ...req.body.data, disabled: 1 }, condition: req.body.condition })
        if (result)
            res.status(result.status).send(result)
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
        console.log(req.body);
        const result = await startDeleteItem({ project: res.project, entityName: req.body.entity, data: { ...req.body.data, disabled: 1 }, condition: req.body.condition })
        if (result) {
            res.status(200).send(result)
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
