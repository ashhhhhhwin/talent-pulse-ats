-- Smart Recruiter — clear candidate/demo data (keeps admin user + job openings)
-- Run in SSMS against SmartRecruiter database before manager demo.

USE SmartRecruiter;
GO

BEGIN TRANSACTION;

DELETE FROM dbo.InterviewHistory;
DELETE FROM dbo.Interviews;
DELETE FROM dbo.MatchScores;
DELETE FROM dbo.Resumes;
DELETE FROM dbo.CandidateSkills;
DELETE FROM dbo.Candidates;
DELETE FROM dbo.AuditLogs;

-- Reset identity columns so new demo uploads start from ID 1
DBCC CHECKIDENT ('dbo.InterviewHistory', RESEED, 0);
DBCC CHECKIDENT ('dbo.Interviews', RESEED, 0);
DBCC CHECKIDENT ('dbo.MatchScores', RESEED, 0);
DBCC CHECKIDENT ('dbo.Resumes', RESEED, 0);
DBCC CHECKIDENT ('dbo.CandidateSkills', RESEED, 0);
DBCC CHECKIDENT ('dbo.Candidates', RESEED, 0);
DBCC CHECKIDENT ('dbo.AuditLogs', RESEED, 0);

COMMIT TRANSACTION;
GO

PRINT 'Candidate data cleared. Admin user and jobs are unchanged.';
GO

-- Optional: full reset including jobs (uncomment if needed)
/*
DELETE FROM dbo.JobSkills;
DELETE FROM dbo.Jobs;
DBCC CHECKIDENT ('dbo.JobSkills', RESEED, 0);
DBCC CHECKIDENT ('dbo.Jobs', RESEED, 0);
-- Then run: npm run db:init
*/
