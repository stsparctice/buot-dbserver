const express = require('express');
const router = require('express').Router()
const { startReadMany, startReadOne, getCount } = require('../modules/read');

//שליחה בפרמס שם טבלה ותנאי בקווארי
router.get('/readMany/:entity', async (req, res) => {
    try {
        let result = await startReadMany({ project: res.project, entityName: req.params.entity, condition: req.query })
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
      console.log(res.project)
      console.log(req.params.entity)
      console.log(req.body.condition)
        let ans = await startReadMany({ project: res.project, entityName: req.params.entity, condition: req.body.condition })
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

        let result = await startReadOne({ project: res.project, entityName: req.params.entity, condition: req.query })
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
        console.log({body:req.body})
        let ans = await startReadOne({ project: res.project, entityName: req.params.entity, condition: req.body.condition,  entitiesFields: req.body.entitiesFields })
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
        let condition = { key: req.params.id }
        console.log({condition})
        let result = await startReadOne({ project: res.project, entityName: req.params.entity, condition })
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

router.post('/count/:entity', express.json(), async (req, res) => {
    try {
        let result = await getCount({ project: res.project, entityName: req.params.entity, condition: req.body.condition })
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



// count entityName+condition
// exsit "
// CONTAINS:{value:'ll oo', fields:["FirstName", "LastName"]}



module.exports = router
