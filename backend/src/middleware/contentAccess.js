const Content = require('../models/Content');

const CONTENT_ROLES = ['creator', 'reviewer', 'manager'];

const findAuthorizedContent = (contentId, user) => {
  if (!CONTENT_ROLES.includes(user?.role)) return null;

  const query = { _id: contentId };
  if (user.role === 'creator') query.creator = user._id;
  return Content.findOne(query);
};

const loadAuthorizedContent = async (req, res, next) => {
  try {
    if (!CONTENT_ROLES.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this content' });
    }

    const content = await findAuthorizedContent(req.params.id, req.user);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    req.content = content;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { findAuthorizedContent, loadAuthorizedContent };
