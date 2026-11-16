const Finding = require('../models/Finding');
const { logAudit } = require('../utils/auditLogger');
const { findAuthorizedContent } = require('../middleware/contentAccess');

// @desc    Get findings for a specific content version
// @route   GET /api/content/:id/findings
// @access  Private
const getFindings = async (req, res, next) => {
  try {
    const { version } = req.query;
    const versionNum = version ? parseInt(version) : 1;

    const findings = await Finding.find({
      contentId: req.content._id,
      versionNumber: versionNum
    }).sort({ severity: 1 });

    res.json({ success: true, count: findings.length, findings });
  } catch (error) {
    next(error);
  }
};

// @desc    Record human decision on a finding (Accept, Edit, or Dismiss with reason)
// @route   PATCH /api/content/:id/findings/:findingId/decision
// @route   PATCH /api/findings/:id/decision (legacy, requires body.contentId)
// @access  Private (Creator, Reviewer, Manager)
const updateFindingDecision = async (req, res, next) => {
  try {
    const contentId = req.params.findingId ? req.params.id : req.body.contentId;
    if (!contentId) {
      return res.status(400).json({ success: false, message: 'Content ID is required' });
    }

    const content = req.content || await findAuthorizedContent(contentId, req.user);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const { action, dismissalReason, editedRewrite } = req.body;

    if (!['accepted', 'edited', 'dismissed', 'pending'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be accepted, edited, dismissed, or pending.'
      });
    }

    if (action === 'dismissed' && (!dismissalReason || dismissalReason.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'A clear dismissal reason is required when dismissing a finding.'
      });
    }

    if (action === 'edited' && (!editedRewrite || editedRewrite.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Edited rewrite text is required when modifying a suggestion.'
      });
    }

    const finding = await Finding.findOne({
      _id: req.params.findingId || req.params.id,
      contentId: content._id
    });
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Finding not found' });
    }

    finding.decision = action;
    finding.decidedBy = req.user._id;
    finding.decidedAt = new Date();

    if (action === 'dismissed') {
      finding.dismissalReason = dismissalReason.trim();
    } else if (action === 'edited') {
      finding.editedRewrite = editedRewrite.trim();
    }

    await finding.save();

    await logAudit({
      user: req.user,
      role: req.user.role,
      action: `FINDING_${action.toUpperCase()}`,
      targetResource: 'Finding',
      targetId: finding._id,
      details: {
        category: finding.category,
        excerpt: finding.excerpt,
        dismissalReason: finding.dismissalReason,
        editedRewrite: finding.editedRewrite
      }
    });

    res.json({
      success: true,
      message: `Finding marked as ${action}`,
      finding
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFindings,
  updateFindingDecision
};
