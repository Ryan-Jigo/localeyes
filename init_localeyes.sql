-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open',
    location JSONB,
    images JSONB,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    reports INT DEFAULT 0,
    abuse_reporters JSONB,
    reporter_id INT REFERENCES users(id),
    reporter_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_votes table
CREATE TABLE IF NOT EXISTS user_votes (
    user_id INT REFERENCES users(id),
    issue_id INT REFERENCES issues(id),
    vote_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(user_id, issue_id)
);

-- Insert default authority users
INSERT INTO users (email, password, role, department, name)
VALUES
('pwd@kseb.localeyes.com', 'authority123', 'authority', 'PWD', 'PWD Authority'),
('water@kerala.localeyes.com', 'authority123', 'authority', 'Water', 'Water Authority'),
('kseb@kerala.localeyes.com', 'authority123', 'authority', 'KSEB', 'KSEB Authority'),
('waste@kerala.localeyes.com', 'authority123', 'authority', 'Waste Management', 'Waste Authority'),
('other@kerala.localeyes.com', 'authority123', 'authority', 'Other', 'Other Authority')
ON CONFLICT (email) DO NOTHING;
