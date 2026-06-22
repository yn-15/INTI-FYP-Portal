-- Sprint 4 Migration
-- Changes:
--   1. Add returned_for_review to ProposalStatus enum (replaces rejected)
--   2. Add lockExpiresAt to ProposalSelection
--   3. Add ProposalRevision table

-- Step 1: Add new enum value
ALTER TYPE "ProposalStatus" ADD VALUE IF NOT EXISTS 'returned_for_review';

-- Note: PostgreSQL does not support removing enum values directly.
-- Existing 'rejected' rows can be migrated:
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
