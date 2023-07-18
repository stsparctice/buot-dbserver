const express = require('express');
const router = require('express').Router()



const create_db = require('./create')
const delete_db = require('./delete')
const read_db = require('./read')
const update_db = require('./update')

router.use('/create_db', create_db)
router.use('/delete_db', delete_db)
router.use('/read_db', read_db)
router.use('/update_db', update_db)