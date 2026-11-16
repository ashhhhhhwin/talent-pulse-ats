# HR Smart Platform – AI-Powered Recruitment Assistant

An AI-powered recruitment assistant that helps HR professionals find the right candidates faster by understanding job descriptions, searching candidate resumes, and recommending the most relevant profiles.

## Overview

Recruitment often involves going through hundreds of resumes to identify candidates who match a particular job requirement. Traditional recruitment systems largely depend on keyword-based searches, which can overlook candidates who have the right experience but describe their skills differently.

**HR Smart Platform** aims to make this process smarter and more efficient using Artificial Intelligence, Natural Language Processing (NLP), Large Language Models (LLMs), and semantic search.

The idea behind this project is simple: instead of manually searching through resumes, an HR professional can describe the kind of candidate they are looking for in natural language. The system understands the requirements, searches the available candidate database, ranks suitable profiles, and presents the recommendations along with an explanation of why each candidate is a good match.

For example, an HR recruiter could enter:

> I'm looking for a Python Developer with at least 3 years of experience, preferably with FastAPI, AWS, Docker, and SQL.

The platform processes the request, searches the candidate database, and returns a ranked list of relevant candidates in an easy-to-understand card-based interface.

The goal is to build something that goes beyond a basic resume keyword matcher and demonstrates how modern AI techniques can be applied to a real-world HR recruitment workflow.

---

## The Problem

Recruiters spend considerable time reviewing resumes and comparing candidate profiles against job descriptions.

Some common challenges include:

- Manually reviewing large numbers of resumes.
- Missing relevant candidates because their resumes use different terminology.
- Difficulty comparing candidates against multiple job requirements.
- Relying heavily on keyword matching.
- Spending time identifying the strengths and gaps in individual candidate profiles.

For example, a job description might mention *REST API development*, while a candidate's resume describes experience building *microservices using FastAPI*.

A traditional keyword-based search might not identify this candidate as a strong match.

This project addresses that limitation through semantic understanding and intelligent candidate matching.

---

## Project Objectives

The primary objectives of HR Smart Platform are:

1. Build an AI-powered recruitment assistant that understands job descriptions written in natural language.
2. Extract important requirements such as skills, experience, and technical qualifications.
3. Process and index candidate resumes for efficient retrieval.
4. Implement semantic search to identify candidates based on contextual relevance rather than exact keyword matches.
5. Combine semantic similarity with skill and experience matching to rank candidates.
6. Provide understandable explanations for candidate recommendations.
7. Present the results through a conversational interface and candidate cards.
8. Design the system with a structure that can eventually integrate with an organization's internal recruitment systems.

---

## Key Features

### 1. Conversational AI Recruitment Assistant

HR professionals can interact with the system using natural language.

Instead of configuring multiple search filters, they can simply describe their requirements through a chatbot interface.

Example:

"Find me a backend developer with Python, FastAPI, AWS, and 4+ years of experience."

The system interprets the request and initiates candidate retrieval.

### 2. Job Description Understanding

The system analyzes the submitted Job Description and identifies relevant information, including:

- Job title and role.
- Required technical skills.
- Preferred skills.
- Minimum years of experience.
- Educational qualifications.
- Relevant technical experience.

The extracted requirements are used by the candidate matching engine.

### 3. Resume Parsing

Candidate resumes are processed to extract useful information.

The extracted information can include:

- Candidate name.
- Contact information.
- Technical skills.
- Work experience.
- Educational background.
- Previous organizations.
- Projects and certifications.

The extracted resume content is used for candidate indexing and matching.

### 4. Semantic Search

One of the important components of this project is semantic search.

Instead of depending entirely on exact keyword matches, the system uses embeddings to understand the contextual meaning of job descriptions and resumes.

For example:

**Job Description:**

Experience in developing REST APIs.

**Candidate Resume:**

Developed backend microservices using Python and FastAPI.

Even though the wording is different, the system can identify the relationship between these requirements and experiences.

### 5. Intelligent Candidate Ranking

Candidates are ranked using multiple matching factors:

- Semantic similarity.
- Required skill coverage.
- Experience relevance.

The objective is to provide a more meaningful ranking than a simple keyword search.

### 6. Explainable Candidate Recommendations

The system should not just display a match percentage.

It should also explain why a candidate was recommended.

For example:

**Why this candidate?**

- Has relevant Python development experience.
- Has worked with FastAPI.
- Demonstrates experience with AWS.
- Meets the required experience criteria.

This helps HR professionals understand the recommendations instead of blindly relying on an AI-generated score.

### 7. Candidate Cards

The matching results are displayed in a card-based interface.

Each candidate card can include:

- Candidate name.
- Years of experience.
- Key technical skills.
- Match score.
- Short candidate summary.
- Reasons for matching.
- Option to view the complete profile.

---

## How It Works

The platform follows two main processing workflows.

### A. Resume Processing Pipeline

Before candidates can be searched, their resumes need to be processed and indexed.

```text
Candidate Resume
       |
       v
   Resume Upload
       |
       v
  PDF/DOCX Parsing
       |
       v
   Text Extraction
       |
       v
  Information Extraction
       |
       v
  Text Preprocessing
       |
       v
 Embedding Generation
       |
       v
 Vector Database
       |
       v
 Candidate Database
```

The processed resume content and candidate metadata are made available for subsequent searches.

### B. Job Description Matching Pipeline

When an HR professional submits a job description, the following workflow is initiated:

```text
     HR User
        |
        v
  Job Description
        |
        v
  LLM / NLP Analysis
        |
        v
 Requirement Extraction
        |
        v
  JD Embedding
        |
        v
  Semantic Search
        |
        v
 Candidate Retrieval
        |
        v
  Matching Engine
        |
        v
 Candidate Ranking
        |
        v
 AI-Generated Explanation
        |
        v
 Candidate Recommendations
```

The final recommendations are displayed in the frontend.

---

## Technology Stack

The project uses modern web development and AI technologies.

| Component | Technology | Purpose |
|---|---|---|
| Frontend | React.js | User interface and chatbot |
| Backend | Python / FastAPI | API development and business logic |
| Programming Language | Python | AI and NLP processing |
| AI / NLP | LLMs | JD understanding and explanations |
| Embeddings | Sentence Transformers | Semantic representation of text |
| Vector Search | FAISS / ChromaDB | Similarity-based candidate retrieval |
| Database | PostgreSQL / SQLite | Candidate information and metadata |
| Resume Processing | PDF/DOCX parsing libraries | Resume text extraction |

*Note: The exact database, embedding model, vector store, and LLM provider can be configured according to the implementation.*

---

## Candidate Matching Methodology

The matching engine combines multiple factors to determine candidate relevance.

### 1. Semantic Similarity

The Job Description and candidate resume are converted into vector embeddings.

The system calculates their similarity using a suitable distance or similarity metric, such as cosine similarity.

This helps identify candidates whose experience is relevant even when their resume does not contain the exact words used in the JD.

### 2. Skill Matching

The system extracts required skills from the Job Description and compares them with the skills identified in each candidate's resume.

For example:

Required skills:

- Python
- FastAPI
- AWS
- SQL
- Docker

Candidate skills:

- Python
- FastAPI
- AWS
- SQL

Skill coverage:

4 out of 5 skills = 80%.

### 3. Experience Matching

The candidate's experience is compared with the experience requirements specified in the Job Description.

For example:

- Required experience: 3 years.
- Candidate experience: 4 years.
- Experience requirement: Satisfied.

### 4. Weighted Matching Score

A possible scoring approach is:

```text
Final Match Score =

(0.50 × Semantic Similarity)
+
(0.30 × Skill Match)
+
(0.20 × Experience Match)
```

Example:

| Matching Factor | Score | Weight |
|---|---:|---:|
| Semantic Similarity | 90% | 50% |
| Skill Match | 80% | 30% |
| Experience Match | 100% | 20% |

Final score:

```text
(90 × 0.50) + (80 × 0.30) + (100 × 0.20)

= 89%
```

These weights are configurable and should be evaluated against the actual dataset.

The score is intended to help HR prioritize profiles. It should not be interpreted as a probability of hiring success.

---

## Role of Generative AI and RAG

Generative AI is used to make the recruitment experience conversational and context-aware.

The LLM can assist with:

- Understanding natural language queries.
- Extracting requirements from job descriptions.
- Interpreting follow-up questions.
- Summarizing candidate profiles.
- Generating explanations for recommendations.

The project can also incorporate Retrieval-Augmented Generation (RAG).

In this approach, the system retrieves relevant candidate information from the database and provides that information as context to the LLM.

```text
     HR Query
        |
        v
   LLM Processing
        |
        v
 Candidate Retrieval
        |
        v
 Relevant Candidate Data
        |
        v
 Context Provided to LLM
        |
        v
 Grounded AI Response
```

This helps ensure that candidate recommendations and explanations are based on retrieved resume information rather than unsupported model assumptions.

---

## Project Architecture

The application follows a modular architecture with separate responsibilities for the frontend, backend, AI services, and data storage.

```text
                  HR PROFESSIONAL
                         |
                         v
                   REACT FRONTEND
                         |
                         v
                    FASTAPI
                         |
           +-------------+-------------+
           |             |             |
           v             v             v
       CHAT SERVICE  MATCHING       RESUME
                     SERVICE       PROCESSING
           |             |             |
           +-------------+-------------+
                         |
              +----------+----------+
              |                     |
              v                     v
        LLM / EMBEDDINGS       DATA STORAGE
                                    |
                           +--------+--------+
                           |                 |
                           v                 v
                     SQL DATABASE      VECTOR STORE
                           |                 |
                           +--------+--------+
                                    |
                                    v
                          CANDIDATE PROFILES
```

The modular structure allows individual components to be improved or replaced without redesigning the entire application.

---

## Dataset

For the academic prototype, a publicly available resume dataset from Kaggle can be used.

The dataset provides sample candidate resumes that can be processed and indexed for testing the matching engine.

The general workflow is:

1. Download the dataset.
2. Inspect and clean the available resume data.
3. Extract resume text.
4. Generate candidate embeddings.
5. Store candidate metadata.
6. Index the embeddings in the vector database.
7. Use the dataset for JD-based candidate retrieval.

The dataset is intended for development and demonstration.

For a production deployment, the system would use authorized candidate information obtained from an organization's recruitment platform, ATS, or internal HR database.

---

## Project Structure

The following is the proposed modular project structure. It can be adjusted to reflect the actual implementation.

```text
HR_SMART_PLATFORM/
│
├── backend/
│   │
│   ├── main.py
│   │
│   ├── routes/
│   │   ├── chat.py
│   │   ├── candidates.py
│   │   └── resumes.py
│   │
│   ├── services/
│   │   ├── embedding_service.py
│   │   ├── matching_service.py
│   │   ├── resume_parser.py
│   │   └── llm_service.py
│   │
│   ├── models/
│   │   └── candidate.py
│   │
│   ├── database/
│   │   └── database.py
│   │
│   └── requirements.txt
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chatbot.jsx
│   │   │   ├── CandidateCard.jsx
│   │   │   └── CandidateList.jsx
│   │   │
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── data/
│   └── resumes/
│
├── .gitignore
└── README.md
```

---

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have the following installed:

- Python 3.10 or later.
- Node.js and npm.
- Git.
- A code editor such as Visual Studio Code.

You will also need API credentials if the selected LLM provider requires them.

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd HR_SMART_PLATFORM
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

Windows:

```bash
venv\Scripts\activate
```

macOS / Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the backend directory and configure the required environment variables.

Example:

```env
LLM_API_KEY=your_api_key
DATABASE_URL=your_database_url
```

Use the environment variable names required by your actual application.

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend should be accessible at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run at the local URL displayed in the terminal, typically:

```text
http://localhost:5173
```

*These commands assume the proposed React, Vite, and FastAPI setup. Adjust them if the repository uses a different configuration.*

---

## API Overview

The following endpoints describe the intended API design.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload-resume` | Upload a candidate resume |
| POST | `/process-resume` | Extract resume information and generate embeddings |
| POST | `/search-candidates` | Search candidates using a Job Description |
| POST | `/chat` | Interact with the AI recruitment assistant |

Example candidate search request:

```json
{
  "job_description": "Looking for a Python Developer with 3+ years of experience in FastAPI, AWS and SQL."
}
```

Example response:

```json
{
  "candidates": [
    {
      "name": "John Doe",
      "experience": 4,
      "skills": [
        "Python",
        "FastAPI",
        "AWS",
        "SQL"
      ],
      "match_score": 91,
      "match_reasons": [
        "Strong Python experience",
        "Relevant FastAPI experience",
        "Meets the required experience"
      ]
    }
  ]
}
```

The request and response structures are illustrative and should be aligned with the implemented API schemas.

---

## Future Enhancements

There are several opportunities to extend this platform beyond the initial implementation.

Some planned enhancements include:

- Integration with existing Applicant Tracking Systems (ATS).
- Conversational candidate filtering.
- Candidate comparison.
- Advanced skill gap analysis.
- AI-generated resume summaries.
- Interview question generation based on candidate profiles and job descriptions.
- Recruitment analytics dashboard.
- Support for multiple job openings.
- Role-based authentication and access control.
- Improved candidate search and ranking algorithms.

These enhancements can gradually turn the prototype into a more complete recruitment assistance platform.

---

## Data Privacy and Responsible AI

Candidate resumes contain personal and potentially sensitive information. Protecting this information is an important consideration.

The platform should follow responsible data-handling practices, including:

- Secure storage of candidate information.
- Restricted access to candidate profiles.
- Protection of API credentials.
- Appropriate handling of personally identifiable information.
- Use of authorized candidate data.
- Transparent explanations for recommendations.

The platform is designed as a decision-support tool, not an automated hiring authority.

**Final recruitment decisions should always remain with qualified HR professionals.**

The matching score should be treated as an indication of relevance, not as an objective measure of a candidate's overall ability or suitability.

The system should also be evaluated for potential bias and should not use protected personal characteristics as ranking criteria.

---

## Why This Project?

I wanted to work on a project that applies modern AI concepts to an actual business problem.

Recruitment is a good example of an area where traditional search mechanisms can be improved through natural language understanding, semantic search, and generative AI.

Rather than building another generic chatbot, this project explores how different AI components can work together to solve a practical problem:

- LLMs for understanding user requirements.
- NLP for extracting meaningful information.
- Embeddings for representing resumes and job descriptions.
- Vector databases for semantic retrieval.
- Ranking algorithms for candidate recommendations.
- RAG for generating responses grounded in retrieved information.

The larger idea is to demonstrate how AI can assist people in making better-informed decisions while keeping humans in control of the process.

---

## Academic Context

This project is developed as part of the **M.Tech in Artificial Intelligence and Machine Learning** programme at BITS Pilani (Work Integrated Learning Programme).

**Project Title:** HR Smart Platform – AI-Powered Candidate Matching and Recruitment Assistant

**Domain:** Artificial Intelligence, Machine Learning, Natural Language Processing, and Generative AI.

---

## Author

Developed as an academic project exploring the practical application of Artificial Intelligence in recruitment and HR technology.

---

## License

This project is intended for academic and educational purposes. A suitable open-source license can be added when the repository is ready for public distribution.

---

*Building a smarter way to connect job requirements with relevant talent.*
