const express = require('express');
const { runQuery, runSingle, executeQuery } = require('../database-sqlite');
const router = express.Router();

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await runQuery(
      'SELECT * FROM issues ORDER BY created_at DESC'
    );
    
    const formattedIssues = issues.map(row => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      location: JSON.parse(row.location),
      images: JSON.parse(row.images),
      abuseReporters: JSON.parse(row.abuse_reporters)
    }));
    
    res.json(formattedIssues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get issues by department
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const issues = await runQuery(
      'SELECT * FROM issues WHERE department = ? ORDER BY created_at DESC',
      [department]
    );
    
    const formattedIssues = issues.map(row => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      location: JSON.parse(row.location),
      images: JSON.parse(row.images),
      abuseReporters: JSON.parse(row.abuse_reporters)
    }));
    
    res.json(formattedIssues);
  } catch (error) {
    console.error('Get issues by department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get issues by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const issues = await runQuery(
      'SELECT * FROM issues WHERE reporter_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    const formattedIssues = issues.map(row => ({
      ...row,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      location: JSON.parse(row.location),
      images: JSON.parse(row.images),
      abuseReporters: JSON.parse(row.abuse_reporters)
    }));
    
    res.json(formattedIssues);
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
    
    await executeQuery(
      `INSERT INTO issues (id, title, description, department, status, location, images, upvotes, downvotes, reports, abuse_reporters, reporter_id, reporter_email, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    
    const issue = await runSingle('SELECT * FROM issues WHERE id = ?', [issueId]);
    
    res.json({
      ...issue,
      createdAt: new Date(issue.created_at),
      updatedAt: new Date(issue.updated_at),
      location: JSON.parse(issue.location),
      images: JSON.parse(issue.images),
      abuseReporters: JSON.parse(issue.abuse_reporters)
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
    const existingVote = await runSingle(
      'SELECT vote_type FROM user_votes WHERE user_id = ? AND issue_id = ?',
      [userId, issueId]
    );
    
    if (existingVote) {
      if (existingVote.vote_type === 'upvote') {
        // Remove upvote
        await executeQuery(
          'DELETE FROM user_votes WHERE user_id = ? AND issue_id = ?',
          [userId, issueId]
        );
        await executeQuery(
          'UPDATE issues SET upvotes = upvotes - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [issueId]
        );
      } else {
        // Change downvote to upvote
        await executeQuery(
          'UPDATE user_votes SET vote_type = ? WHERE user_id = ? AND issue_id = ?',
          ['upvote', userId, issueId]
        );
        await executeQuery(
          'UPDATE issues SET upvotes = upvotes + 1, downvotes = downvotes - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [issueId]
        );
      }
    } else {
      // Add new upvote
      await executeQuery(
        'INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES (?, ?, ?)',
        [userId, issueId, 'upvote']
      );
      await executeQuery(
        'UPDATE issues SET upvotes = upvotes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
    const existingVote = await runSingle(
      'SELECT vote_type FROM user_votes WHERE user_id = ? AND issue_id = ?',
      [userId, issueId]
    );
    
    if (existingVote) {
      if (existingVote.vote_type === 'downvote') {
        // Remove downvote
        await executeQuery(
          'DELETE FROM user_votes WHERE user_id = ? AND issue_id = ?',
          [userId, issueId]
        );
        await executeQuery(
          'UPDATE issues SET downvotes = downvotes - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [issueId]
        );
      } else {
        // Change upvote to downvote
        await executeQuery(
          'UPDATE user_votes SET vote_type = ? WHERE user_id = ? AND issue_id = ?',
          ['downvote', userId, issueId]
        );
        await executeQuery(
          'UPDATE issues SET upvotes = upvotes - 1, downvotes = downvotes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [issueId]
        );
      }
    } else {
      // Add new downvote
      await executeQuery(
        'INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES (?, ?, ?)',
        [userId, issueId, 'downvote']
      );
      await executeQuery(
        'UPDATE issues SET downvotes = downvotes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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

    await executeQuery(
      'UPDATE issues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
    const upvotes = await runQuery(
      'SELECT issue_id FROM user_votes WHERE user_id = ? AND vote_type = ?',
      [userId, 'upvote']
    );
    const downvotes = await runQuery(
      'SELECT issue_id FROM user_votes WHERE user_id = ? AND vote_type = ?',
      [userId, 'downvote']
    );
    
    res.json({
      upvotes: upvotes.map(row => row.issue_id),
      downvotes: downvotes.map(row => row.issue_id)
    });
  } catch (error) {
    console.error('Get votes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
