const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Schema & Model
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anonymous' }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

// POST Route
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const post = new Post({
      title,
      content,
      author: author || 'Anonymous'
    });

    const savedPost = await post.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post: savedPost
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Simple POST API is running! Send POST to /api/posts' });
});

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mypostdb';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Test POST → http://localhost:${PORT}/api/posts`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
