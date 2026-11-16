const express = require('express');
const router = express.Router();
const {
  createContent,
  getContents,
  getContentById,
  triggerReview,
  submitRevision,
  compareVersions
} = require('../controllers/contentController');
const { getFindings, updateFindingDecision } = require('../controllers/findingController');
const { addComment, requestChanges, approveContent, getContentHistory } = require('../controllers/workflowController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { loadAuthorizedContent } = require('../middleware/contentAccess');

router.route('/')
  .post(protect, authorize('creator', 'manager'), createContent)
  .get(protect, getContents);

router.get('/:id/compare', protect, loadAuthorizedContent, compareVersions);
router.get('/:id/findings', protect, loadAuthorizedContent, getFindings);
router.get('/:id/history', protect, loadAuthorizedContent, getContentHistory);

router.post('/:id/review', protect, loadAuthorizedContent, triggerReview);
router.post('/:id/revisions', protect, authorize('creator', 'manager'), loadAuthorizedContent, submitRevision);
router.post('/:id/comments', protect, loadAuthorizedContent, addComment);
router.post('/:id/request-changes', protect, authorize('reviewer', 'manager'), loadAuthorizedContent, requestChanges);
router.post('/:id/approve', protect, authorize('reviewer', 'manager'), loadAuthorizedContent, approveContent);
router.patch('/:id/findings/:findingId/decision', protect, loadAuthorizedContent, updateFindingDecision);

router.route('/:id')
  .get(protect, loadAuthorizedContent, getContentById);

module.exports = router;
