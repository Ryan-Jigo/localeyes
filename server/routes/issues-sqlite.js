const express = require('express');
const crypto = require('crypto');
const { runQuery, runSingle, executeQuery } = require('../database-sqlite');
const { requireAuth, requireAuthority } = require('../middleware/auth');

const router = express.Router();

const VALID_STATUSES = ['Open', 'In Progress', 'Resolved'];
const MAX_TITLE_LENGTH = 200;
const MAX_DESC_LENGTH = 2000;

function mapRow(row) {
  return {
    ...row,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    location: JSON.parse(row.location),
    images: JSON.parse(row.images),
    abuseReporters: JSON.parse(row.abuse_reporters),
    reporterId: row.reporter_id,
    reporterEmail: row.reporter_email,
    credibility: row.credibility || 0
  };
}

// GET /api/issues — all issues, with optional pagination & filtering
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const department = req.query.department;
    const status = req.query.status;
    const search = req.query.search;

    let query = 'SELECT * FROM issues WHERE 1=1';
    const params = [];

    if (department) {
      query += ` AND department = ?`;
      params.push(department);
    }
    if (status && VALID_STATUSES.includes(status)) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const issues = await runQuery(query, params);

    // Total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM issues WHERE 1=1';
    const countParams = params.slice(0, params.length - 2); // remove limit/offset
    let cIdx = 0;
    if (department) { countQuery += ` AND department = ?`; cIdx++; }
    if (status && VALID_STATUSES.includes(status)) { countQuery += ` AND status = ?`; cIdx++; }
    if (search) { countQuery += ` AND (title LIKE ? OR description LIKE ?)`; cIdx += 2; }

    const countResult = await runSingle(countQuery, countParams);
    const total = parseInt(countResult.count);

    res.json({
      issues: issues.map(mapRow),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/issues/department/:department
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const issues = await runQuery(
      'SELECT * FROM issues WHERE department = ? ORDER BY created_at DESC',
      [department]
    );
    res.json(issues.map(mapRow));
  } catch (error) {
    console.error('Get issues by department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/issues/user/:userId
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userId !== userId && req.user.role !== 'authority') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const issues = await runQuery(
      'SELECT * FROM issues WHERE reporter_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(issues.map(mapRow));
  } catch (error) {
    console.error('Get issues by user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/issues — create new issue
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, department, location, images, reporterId, reporterEmail } = req.body;
    
    if (!title || !description || !department || !location || !reporterId || !reporterEmail) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const sanitizedTitle = String(title).trim().slice(0, MAX_TITLE_LENGTH);
    const sanitizedDesc = String(description).trim().slice(0, MAX_DESC_LENGTH);
    const sanitizedDept = String(department).trim();

    if (!sanitizedTitle || !sanitizedDesc) {
      return res.status(400).json({ error: 'Title and description cannot be empty' });
    }

    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      return res.status(400).json({ error: 'Valid location coordinates are required' });
    }

    const now = new Date();
    const issueId = crypto.randomUUID();
    
    await executeQuery(
      `INSERT INTO issues (id, title, description, department, status, location, images, upvotes, downvotes, reports, abuse_reporters, reporter_id, reporter_email, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        issueId,
        sanitizedTitle,
        sanitizedDesc,
        sanitizedDept,
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
    res.status(201).json(mapRow(issue));
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upvote issue
router.post('/:issueId/upvote', requireAuth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.body;
    
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const existingVote = await runSingle(
      'SELECT vote_type FROM user_votes WHERE user_id = ? AND issue_id = ?',
      [userId, issueId]
    );
    
    if (existingVote) {
      if (existingVote.vote_type === 'upvote') {
        await executeQuery('DELETE FROM user_votes WHERE user_id = ? AND issue_id = ?', [userId, issueId]);
        await executeQuery('UPDATE issues SET upvotes = MAX(0, upvotes - 1), updated_at = CURRENT_TIMESTAMP WHERE id = ?', [issueId]);
      } else {
        await executeQuery('UPDATE user_votes SET vote_type = ? WHERE user_id = ? AND issue_id = ?', ['upvote', userId, issueId]);
        await executeQuery('UPDATE issues SET upvotes = upvotes + 1, downvotes = MAX(0, downvotes - 1), updated_at = CURRENT_TIMESTAMP WHERE id = ?', [issueId]);
      }
    } else {
      await executeQuery('INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES (?, ?, ?)', [userId, issueId, 'upvote']);
      await executeQuery('UPDATE issues SET upvotes = upvotes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [issueId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Downvote issue
router.post('/:issueId/downvote', requireAuth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.body;
    
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const existingVote = await runSingle(
      'SELECT vote_type FROM user_votes WHERE user_id = ? AND issue_id = ?',
      [userId, issueId]
    );
    
    if (existingVote) {
      if (existingVote.vote_type === 'downvote') {
        await executeQuery('DELETE FROM user_votes WHERE user_id = ? AND issue_id = ?', [userId, issueId]);
        await executeQuery('UPDATE issues SET downvotes = MAX(0, downvotes - 1), updated_at = CURRENT_TIMESTAMP WHERE id = ?', [issueId]);
      } else {
        await executeQuery('UPDATE user_votes SET vote_type = ? WHERE user_id = ? AND issue_id = ?', ['downvote', userId, issueId]);
        await executeQuery('UPDATE issues SET upvotes = MAX(0, upvotes - 1), downvotes = downvotes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [issueId]);
      }
    } else {
      await executeQuery('INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES (?, ?, ?)', [userId, issueId, 'downvote']);
      await executeQuery('UPDATE issues SET downvotes = downvotes + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [issueId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Downvote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue status
router.put('/:issueId/status', requireAuth, requireAuthority, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;
    
    if (!status) return res.status(400).json({ error: 'Status is required' });
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

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
router.get('/votes/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
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

// GET /credibility-votes/:authorityId – get this authority's credibility votes
router.get('/credibility-votes/:authorityId', requireAuth, requireAuthority, async (req, res) => {
  try {
    const { authorityId } = req.params;
    if (req.user.userId !== authorityId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const votes = await runQuery(
      'SELECT issue_id, vote FROM credibility_votes WHERE authority_id = ?',
      [authorityId]
    );
    res.json(votes);
  } catch (error) {
    console.error('Get credibility votes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /:issueId/credibility – authority votes credibility (toggleable)
router.post('/:issueId/credibility', requireAuth, requireAuthority, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { vote } = req.body; // +1 or -1
    const authorityId = req.user.userId;

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ error: 'Vote must be 1 or -1' });
    }

    const existing = await runSingle(
      'SELECT vote FROM credibility_votes WHERE authority_id = ? AND issue_id = ?',
      [authorityId, issueId]
    );

    if (existing) {
      if (existing.vote === vote) {
        // Same vote — toggle off
        await executeQuery('DELETE FROM credibility_votes WHERE authority_id = ? AND issue_id = ?', [authorityId, issueId]);
        await executeQuery('UPDATE issues SET credibility = credibility - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [vote, issueId]);
        res.json({ success: true, action: 'removed' });
      } else {
        // Different vote — switch
        const diff = vote - existing.vote;
        await executeQuery('UPDATE credibility_votes SET vote = ? WHERE authority_id = ? AND issue_id = ?', [vote, authorityId, issueId]);
        await executeQuery('UPDATE issues SET credibility = credibility + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [diff, issueId]);
        res.json({ success: true, action: 'changed' });
      }
    } else {
      // New vote
      await executeQuery('INSERT INTO credibility_votes (authority_id, issue_id, vote) VALUES (?, ?, ?)', [authorityId, issueId, vote]);
      await executeQuery('UPDATE issues SET credibility = credibility + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [vote, issueId]);
      res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Credibility vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
