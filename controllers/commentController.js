import Comment from '../models/Comment.js';
import BlogPost from '../models/BlogPost.js';

// @desc    获取某篇文章的所有评论
// @route   GET /api/blog/:postId/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).populate('author', 'username');
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// @desc    发表评论
// @route   POST /api/blog/:postId/comments
// @access  Private
const createComment = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    const comment = new Comment({
      body: req.body.body,
      author: req.user._id,
      post: req.params.postId
    });

    const createdComment = await comment.save();
    res.status(201).json(createdComment);
  } catch (error) {
    next(error);
  }
};

export { getComments, createComment };