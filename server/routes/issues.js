const express = require('express');
const crypto = require('crypto');
const { pool } = require('../database');
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
    location: row.location,
    images: row.images || [],
    abuseReporters: row.abuse_reporters || []
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
    let paramIdx = 1;

    if (department) {
      query += ` AND department = $${paramIdx++}`;
      params.push(department);
    }
    if (status && VALID_STATUSES.includes(status)) {
      query += ` AND status = $${paramIdx++}`;
      params.push(status);
    }
    if (search) {
      query += ` AND (title ILIKE $${paramIdx} OR description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM issues WHERE 1=1';
    const countParams = params.slice(0, params.length - 2); // remove limit/offset
    let cIdx = 1;
    if (department) countQuery += ` AND department = $${cIdx++}`;
    if (status && VALID_STATUSES.includes(status)) countQuery += ` AND status = $${cIdx++}`;
    if (search) { countQuery += ` AND (title ILIKE $${cIdx} OR description ILIKE $${cIdx})`; cIdx++; }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      issues: result.rows.map(mapRow),
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
    const result = await pool.query(
      'SELECT * FROM issues WHERE department = $1 ORDER BY created_at DESC',
      [department]
    );
    res.json(result.rows.map(mapRow));
  } catch (error) {
    console.error('Get issues by department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/issues/user/:userId
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    // Users can only see their own issues (unless it's the same user)
    if (req.user.userId !== userId && req.user.role !== 'authority') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await pool.query(
      'SELECT * FROM issues WHERE reporter_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows.map(mapRow));
  } catch (error) {
    console.error('Get issues by user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/issues/votes/:userId
router.get('/votes/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
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

// POST /api/issues — create new issue (auth required)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, department, location, images, reporterId, reporterEmail } = req.body;

    if (!title || !description || !department || !location || !reporterId || !reporterEmail) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // ✅ Input sanitization
    const sanitizedTitle = String(title).trim().slice(0, MAX_TITLE_LENGTH);
    const sanitizedDesc = String(description).trim().slice(0, MAX_DESC_LENGTH);
    const sanitizedDept = String(department).trim();

    if (!sanitizedTitle || !sanitizedDesc) {
      return res.status(400).json({ error: 'Title and description cannot be empty' });
    }

    if (!location.latitude || !location.longitude) {
      return res.status(400).json({ error: 'Valid location coordinates are required' });
    }

    // ✅ UUID instead of Date.now()
    const issueId = crypto.randomUUID();
    const now = new Date();

    const result = await pool.query(
      `INSERT INTO issues (id, title, description, department, status, location, images, upvotes, downvotes, reports, abuse_reporters, reporter_id, reporter_email, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        issueId,
        sanitizedTitle,
        sanitizedDesc,
        sanitizedDept,
        'Open',
        JSON.stringify(location),
        JSON.stringify(images || []),
        0, 0, 0,
        JSON.stringify([]),
        reporterId,
        reporterEmail,
        now.toISOString(),
        now.toISOString()
      ]
    );

    res.status(201).json(mapRow(result.rows[0]));
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/issues/:issueId/upvote — vote (auth required)
router.post('/:issueId/upvote', requireAuth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const voteResult = await pool.query(
      'SELECT vote_type FROM user_votes WHERE user_id = $1 AND issue_id = $2',
      [userId, issueId]
    );

    if (voteResult.rows.length > 0) {
      const voteType = voteResult.rows[0].vote_type;
      if (voteType === 'upvote') {
        await pool.query('DELETE FROM user_votes WHERE user_id = $1 AND issue_id = $2', [userId, issueId]);
        await pool.query('UPDATE issues SET upvotes = GREATEST(0, upvotes - 1), updated_at = NOW() WHERE id = $1', [issueId]);
      } else {
        await pool.query('UPDATE user_votes SET vote_type = $1 WHERE user_id = $2 AND issue_id = $3', ['upvote', userId, issueId]);
        await pool.query('UPDATE issues SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1), updated_at = NOW() WHERE id = $1', [issueId]);
      }
    } else {
      await pool.query('INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES ($1, $2, $3)', [userId, issueId, 'upvote']);
      await pool.query('UPDATE issues SET upvotes = upvotes + 1, updated_at = NOW() WHERE id = $1', [issueId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/issues/:issueId/downvote — vote (auth required)
router.post('/:issueId/downvote', requireAuth, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const voteResult = await pool.query(
      'SELECT vote_type FROM user_votes WHERE user_id = $1 AND issue_id = $2',
      [userId, issueId]
    );

    if (voteResult.rows.length > 0) {
      const voteType = voteResult.rows[0].vote_type;
      if (voteType === 'downvote') {
        await pool.query('DELETE FROM user_votes WHERE user_id = $1 AND issue_id = $2', [userId, issueId]);
        await pool.query('UPDATE issues SET downvotes = GREATEST(0, downvotes - 1), updated_at = NOW() WHERE id = $1', [issueId]);
      } else {
        await pool.query('UPDATE user_votes SET vote_type = $1 WHERE user_id = $2 AND issue_id = $3', ['downvote', userId, issueId]);
        await pool.query('UPDATE issues SET upvotes = GREATEST(0, upvotes - 1), downvotes = downvotes + 1, updated_at = NOW() WHERE id = $1', [issueId]);
      }
    } else {
      await pool.query('INSERT INTO user_votes (user_id, issue_id, vote_type) VALUES ($1, $2, $3)', [userId, issueId, 'downvote']);
      await pool.query('UPDATE issues SET downvotes = downvotes + 1, updated_at = NOW() WHERE id = $1', [issueId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Downvote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/issues/:issueId/status — authority only
router.put('/:issueId/status', requireAuth, requireAuthority, async (req, res) => {
  try {
    const { issueId } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });
    if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const result = await pool.query(
      'UPDATE issues SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
      [status, issueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
