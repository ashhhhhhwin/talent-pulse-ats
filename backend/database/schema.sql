-- Smart Recruiter – Microsoft SQL Server Schema
-- Run in SSMS against your SQL Server instance

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'SmartRecruiter')
BEGIN
  CREATE DATABASE SmartRecruiter;
END
GO

USE SmartRecruiter;
GO

-- Roles
IF OBJECT_ID('dbo.Roles', 'U') IS NULL
CREATE TABLE dbo.Roles (
  RoleId INT IDENTITY(1,1) PRIMARY KEY,
  RoleName NVARCHAR(50) NOT NULL UNIQUE
);

-- Users
IF OBJECT_ID('dbo.Users', 'U') IS NULL
CREATE TABLE dbo.Users (
  UserId INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(120) NOT NULL,
  Email NVARCHAR(255) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(255) NOT NULL,
  RoleId INT NOT NULL REFERENCES dbo.Roles(RoleId),
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Jobs
IF OBJECT_ID('dbo.Jobs', 'U') IS NULL
CREATE TABLE dbo.Jobs (
  JobId INT IDENTITY(1,1) PRIMARY KEY,
  Title NVARCHAR(200) NOT NULL,
  Description NVARCHAR(MAX) NOT NULL,
  MinimumExperience INT NOT NULL DEFAULT 0,
  CreatedBy INT NULL REFERENCES dbo.Users(UserId),
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  Status NVARCHAR(20) NOT NULL DEFAULT 'Open'
);

-- JobSkills
IF OBJECT_ID('dbo.JobSkills', 'U') IS NULL
CREATE TABLE dbo.JobSkills (
  JobSkillId INT IDENTITY(1,1) PRIMARY KEY,
  JobId INT NOT NULL REFERENCES dbo.Jobs(JobId) ON DELETE CASCADE,
  SkillName NVARCHAR(120) NOT NULL,
  SkillNormalized NVARCHAR(120) NOT NULL,
  IsMandatory BIT NOT NULL DEFAULT 1
);

-- Candidates
IF OBJECT_ID('dbo.Candidates', 'U') IS NULL
CREATE TABLE dbo.Candidates (
  CandidateId INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(120) NOT NULL,
  Email NVARCHAR(255) NULL,
  Phone NVARCHAR(50) NULL,
  ExperienceYears INT NOT NULL DEFAULT 0,
  Education NVARCHAR(500) NULL,
  CurrentTitle NVARCHAR(200) NULL,
  Location NVARCHAR(120) NULL,
  Summary NVARCHAR(MAX) NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Resumes
IF OBJECT_ID('dbo.Resumes', 'U') IS NULL
CREATE TABLE dbo.Resumes (
  ResumeId INT IDENTITY(1,1) PRIMARY KEY,
  CandidateId INT NOT NULL REFERENCES dbo.Candidates(CandidateId) ON DELETE CASCADE,
  FileName NVARCHAR(255) NOT NULL,
  FilePath NVARCHAR(500) NOT NULL,
  ExtractedText NVARCHAR(MAX) NULL,
  UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- CandidateSkills
IF OBJECT_ID('dbo.CandidateSkills', 'U') IS NULL
CREATE TABLE dbo.CandidateSkills (
  CandidateSkillId INT IDENTITY(1,1) PRIMARY KEY,
  CandidateId INT NOT NULL REFERENCES dbo.Candidates(CandidateId) ON DELETE CASCADE,
  SkillName NVARCHAR(120) NOT NULL,
  SkillNormalized NVARCHAR(120) NOT NULL
);

-- MatchScores
IF OBJECT_ID('dbo.MatchScores', 'U') IS NULL
CREATE TABLE dbo.MatchScores (
  MatchId INT IDENTITY(1,1) PRIMARY KEY,
  JobId INT NOT NULL REFERENCES dbo.Jobs(JobId) ON DELETE CASCADE,
  CandidateId INT NOT NULL REFERENCES dbo.Candidates(CandidateId) ON DELETE CASCADE,
  SemanticScore DECIMAL(5,2) NOT NULL,
  SkillScore DECIMAL(5,2) NOT NULL,
  ExperienceScore DECIMAL(5,2) NOT NULL,
  MandatoryScore DECIMAL(5,2) NOT NULL,
  FinalScore DECIMAL(5,2) NOT NULL,
  MatchedSkills NVARCHAR(MAX) NULL,
  MissingSkills NVARCHAR(MAX) NULL,
  Explanation NVARCHAR(MAX) NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_MatchScores_JobCandidate UNIQUE (JobId, CandidateId)
);

-- Interviews (pipeline)
IF OBJECT_ID('dbo.Interviews', 'U') IS NULL
CREATE TABLE dbo.Interviews (
  InterviewId INT IDENTITY(1,1) PRIMARY KEY,
  CandidateId INT NOT NULL REFERENCES dbo.Candidates(CandidateId) ON DELETE CASCADE,
  JobId INT NOT NULL REFERENCES dbo.Jobs(JobId),
  Stage NVARCHAR(50) NOT NULL DEFAULT 'APPLIED',
  ScheduledDate DATETIME2 NULL,
  Status NVARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  Notes NVARCHAR(MAX) NULL
);

-- InterviewHistory
IF OBJECT_ID('dbo.InterviewHistory', 'U') IS NULL
CREATE TABLE dbo.InterviewHistory (
  HistoryId INT IDENTITY(1,1) PRIMARY KEY,
  CandidateId INT NOT NULL REFERENCES dbo.Candidates(CandidateId),
  JobId INT NULL,
  PreviousStage NVARCHAR(50) NULL,
  NewStage NVARCHAR(50) NOT NULL,
  ChangedBy INT NULL REFERENCES dbo.Users(UserId),
  ChangedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- AuditLogs
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
CREATE TABLE dbo.AuditLogs (
  AuditId INT IDENTITY(1,1) PRIMARY KEY,
  UserId INT NULL REFERENCES dbo.Users(UserId),
  Action NVARCHAR(100) NOT NULL,
  Entity NVARCHAR(100) NOT NULL,
  EntityId INT NULL,
  Timestamp DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Indexes
CREATE NONCLUSTERED INDEX IX_Users_Email ON dbo.Users(Email);
CREATE NONCLUSTERED INDEX IX_Jobs_Status ON dbo.Jobs(Status);
CREATE NONCLUSTERED INDEX IX_JobSkills_JobId ON dbo.JobSkills(JobId);
CREATE NONCLUSTERED INDEX IX_CandidateSkills_CandidateId ON dbo.CandidateSkills(CandidateId);
CREATE NONCLUSTERED INDEX IX_MatchScores_JobId_FinalScore ON dbo.MatchScores(JobId, FinalScore DESC);
CREATE NONCLUSTERED INDEX IX_Interviews_CandidateId ON dbo.Interviews(CandidateId);
CREATE NONCLUSTERED INDEX IX_AuditLogs_Timestamp ON dbo.AuditLogs(Timestamp DESC);

-- Seed roles
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE RoleName = 'ADMIN')
  INSERT INTO dbo.Roles (RoleName) VALUES ('ADMIN'), ('RECRUITER'), ('HIRING_MANAGER');
GO
