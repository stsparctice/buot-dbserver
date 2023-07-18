const express = require('express');
const { compareConfigWithSql } = require('../modules/config/compareConfig');
const router = require('./read');

router.get('/compare', async (req, res) => {
    try {
        let result = await compareConfigWithSql()
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

module.exports=router