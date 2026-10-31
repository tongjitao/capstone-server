import BlogPost from '../models/BlogPost.js';
import Comment from '../models/Comment.js';

// @desc    获取所有文章
// @route   GET /api/blog
// @access  Public
const getBlogPosts = async (req, res, next) => {
  try {
    const posts = await BlogPost.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc    获取单篇文章及评论
// @route   GET /api/blog/:id
// @access  Public
const getBlogPostById = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' }
      });
      
    if (post) {
      res.json(post);
    } else {
      res.status(404);
      throw new Error('Blog post not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    创建文章
// @route   POST /api/blog
// @access  Private
const createBlogPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = new BlogPost({
      title,
      content,
      author: req.user._id,
    });
    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    next(error);
  }
};

// @desc    更新文章 (只有作者能改)
// @route   PUT /api/blog/:id
// @access  Private
const updateBlogPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    // 验证权限
    if (post.author.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this post');
    }

    post.title = title || post.title;
    post.content = content || post.content;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    删除文章 (只有作者能删)
// @route   DELETE /api/blog/:id
// @access  Private
const deleteBlogPost = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Blog post not found');
    }

    // 验证权限
    if (post.author.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this post');
    }

    await post.deleteOne();
    res.json({ message: 'Blog post removed' });
  } catch (error) {
    next(error);
  }
};

export { getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost };