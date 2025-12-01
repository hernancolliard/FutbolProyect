CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    replied_at TIMESTAMPTZ,
    reply_message TEXT,
    replied_by_admin_id INTEGER REFERENCES usuarios(id)
);
