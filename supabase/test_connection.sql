-- ============================================================================
-- Supabase Connection Test Script
-- Run this in Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS test_connection (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- 2. Insert test records
INSERT INTO test_connection (name)
VALUES ('Scrap Mitra'), ('Supabase Connected');

-- 3. Enable Row Level Security & grant anon read access
ALTER TABLE test_connection ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON test_connection TO anon;

DROP POLICY IF EXISTS "Allow test read" ON test_connection;
CREATE POLICY "Allow test read"
ON test_connection
FOR SELECT
TO anon
USING (true);

