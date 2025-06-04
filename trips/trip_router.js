const express = require('express');
const { createTrip,getTripById,TripMainPage} = require('./trip_controller.js');
const {Auth} =require('../middleware/auth_middleware.js');

const router = express.Router();

// Create a new trip
router.post('/create',Auth,createTrip);
router.get('/', Auth,TripMainPage);
router.get('/:id',Auth,getTripById);



module.exports = router;
