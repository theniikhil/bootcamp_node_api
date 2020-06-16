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
const { protect, authorize } = require('../middlewares/auth');

// Include other resources router
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

// Re-Route to another route
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('admin', 'publisher'), createBootcamp);

router.route('/:id/photo').put(uploadPhotoBootcamp);

router
  .route('/:id')
  .get(advancedResults((Bootcamp, 'courses'), getBootcamp))
  .put(protect, authorize('admin', 'publisher'), updateBootcamp)
  .delete(protect, authorize('admin', 'publisher'), deleteBootcamp);

module.exports = router;
