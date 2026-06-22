-- Sprint 4 Migration — Part 2
-- (Run after 20260609000001_sprint4_changes, which added the enum value)

-- Step 1: Migrate existing rejected rows to the new status
UPDATE proposals SET status = 'returned_for_review' WHERE status = 'rejected';

-- Step 2: Add lockExpiresAt to proposal_selections
ALTER TABLE proposal_selections
  ADD COLUMN IF NOT EXISTS lock_expires_at TIMESTAMP;

-- Step 3: Create proposal_revisions table
CREATE TABLE IF NOT EXISTS proposal_revisions (
  id            SERIAL PRIMARY KEY,
  revision_num  INTEGER NOT NULL,
  changed_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  snapshot      JSONB NOT NULL,
  proposal_id   INTEGER NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  changed_by    INTEGER NOT NULL REFERENCES users(id)
);
