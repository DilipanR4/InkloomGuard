const express = require('express');
const router = express.Router();
const {
  getOverviewAnalytics,
  getFindingsAnalytics,
  getRulesAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/overview', protect, authorize('reviewer', 'manager'), getOverviewAnalytics);
router.get('/findings', protect, authorize('reviewer', 'manager'), getFindingsAnalytics);
router.get('/rules', protect, authorize('reviewer', 'manager'), getRulesAnalytics);

module.exports = router;
