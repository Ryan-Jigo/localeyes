const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Get all issues
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM issues ORDER BY created_at DESC'
    );
    
    const issues = result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      location: row.location,
      images: row.images || [],
      abuseReporters: row.abuse_reporters || []
    }));
    
    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get issues by department
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const result = await pool.query(
      'SELECT * FROM issues WHERE department = $1 ORDER BY created_at DESC',
      [department]
    );
    
    const issues = result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      location: row.location,
      images: row.images || [],
      abuseReporters: row.abuse_reporters || []
    }));
    
    res.json(issues);
  } catch (error) {
    console.error('Get issues by department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get issues by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT * FROM issues WHERE reporter_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    const issues = result.rows.map(row => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      location: row.location,
      images: row.images || [],
      abuseReporters: row.abuse_reporters || []
    }));
    
    res.json(issues);
  } catch (error) {
    console.error('Get issues by user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new issue
router.post('/', async (req, res) => {
  try {
    const { title, description, department, location, images, reporterId, reporterEmail } = req.body;
    
    if (!title || !description || !department || !location || !reporterId || !reporterEmail) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const now = new Date();
    const issueId = Date.now().toString();
    
    const result = await pool.query(
      `INSERT INTO issues (id, title, description, department, status, location, images, upvotes, downvotes, reports, abuse_reporters, reporter_id, reporter_email, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        issueId,
        title,
        description,
        department,
        'Open',
        JSON.stringify(location),
        JSON.stringify(images || []),
        0,
        0,
        0,
        JSON.stringify([]),
        reporterId,
        reporterEmail,
        now.toISOString(),
        now.toISOString()
      ]
    );
    
    const issue = result.rows[0];
    res.json({
      ...issue,
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
      location: issue.location,
      images: issue.images || [],
      abuseReporters: issue.abuse_reporters || []
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upvote issue
router.post('/:issueId/upvote', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user already voted
    const voteResult = await pool.query(
      'SELECT vote_type FROM user_votes WHERE user_id = $1 AND issue_id = $2',
      [userId, issueId]
    );
    
    if (voteResult.rows.length > 0) {
      const voteType = voteResult.rows[0].vote_type;
      if (voteType === 'upvote') {
        // Remove upvote
        await pool.query(
          'DELETE FROM user_votes WHERE user_id = $1 AND issue_id = $2',
          [userId, issueId]
        );
        await pool.query(
          'UPDATE issues SET upvotes = upvotes - 1, updated_at = NOW() WHERE id = $1',
          [issueId]
        );
      } else {
        // Change downvote to upvote
        await pool.query(
          'UPDATE user_votes SET vote_type = $1 WHERE user_id = $2 AND issue_id = $3',
          ['upvote', userId, issueId]
        );
        await pool.query(
          'UPDATE issues SET upvotes = upvotes + 1, downvotes = downvotes - 1, updated_at = NOW() WHERE id = $1',
          [issueId]
        );
      }
    } else {
      // Add new upvote
      await pool.query(
        'INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES ($1, $2, $3)',
        [userId, issueId, 'upvote']
      );
      await pool.query(
        'UPDATE issues SET upvotes = upvotes + 1, updated_at = NOW() WHERE id = $1',
        [issueId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Downvote issue
router.post('/:issueId/downvote', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user already voted
    const voteResult = await pool.query(
      'SELECT vote_type FROM user_votes WHERE user_id = $1 AND issue_id = $2',
      [userId, issueId]
    );
    
    if (voteResult.rows.length > 0) {
      const voteType = voteResult.rows[0].vote_type;
      if (voteType === 'downvote') {
        // Remove downvote
        await pool.query(
          'DELETE FROM user_votes WHERE user_id = $1 AND issue_id = $2',
          [userId, issueId]
        );
        await pool.query(
          'UPDATE issues SET downvotes = downvotes - 1, updated_at = NOW() WHERE id = $1',
          [issueId]
        );
      } else {
        // Change upvote to downvote
        await pool.query(
          'UPDATE user_votes SET vote_type = $1 WHERE user_id = $2 AND issue_id = $3',
          ['downvote', userId, issueId]
        );
        await pool.query(
          'UPDATE issues SET upvotes = upvotes - 1, downvotes = downvotes + 1, updated_at = NOW() WHERE id = $1',
          [issueId]
        );
      }
    } else {
      // Add new downvote
      await pool.query(
        'INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES ($1, $2, $3)',
        [userId, issueId, 'downvote']
      );
      await pool.query(
        'UPDATE issues SET downvotes = downvotes + 1, updated_at = NOW() WHERE id = $1',
        [issueId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Downvote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue status
router.put('/:issueId/status', async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await pool.query(
      'UPDATE issues SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, issueId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user votes
router.get('/votes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const upvotesResult = await pool.query(
      'SELECT issue_id FROM user_votes WHERE user_id = $1 AND vote_type = $2',
      [userId, 'upvote']
    );
    const downvotesResult = await pool.query(
      'SELECT issue_id FROM user_votes WHERE user_id = $1 AND vote_type = $2',
      [userId, 'downvote']
    );
    
    res.json({
      upvotes: upvotesResult.rows.map(row => row.issue_id),
      downvotes: downvotesResult.rows.map(row => row.issue_id)
    });
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
