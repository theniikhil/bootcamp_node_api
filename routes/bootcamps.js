const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  uploadPhotoBootcamp,
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middlewares/advancedResults');

// Include other resources router
const courseRouter = require('./courses');

const router = express.Router();

// Re-Route to another route
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(createBootcamp);

router.route('/:id/photo').put(uploadPhotoBootcamp);

router
  .route('/:id')
  .get(advancedResults((Bootcamp, 'courses'), getBootcamp))
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
