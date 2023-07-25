const express = require('express');
const router = require('express').Router()
const data = require('../data/data.json')
const { startCreate } = require('../modules/create');

router.post('/createOne', express.json(), async (req, res) => {
    try {
        const result = await startCreate({ project: res.project, entityName: req.body.entity, values: req.body.values })
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

module.exports = router


// const teacher= {
//     entity:'Teacher',
//     values:{
//         TeacherName:'x', Phone:'1234', Email:'gfhd'
//     }
// }

