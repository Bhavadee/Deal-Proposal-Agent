# AI Proposal Backend - Architecture Diagram Generation Prompt

## Complete System Architecture Prompt

Create a comprehensive system architecture diagram for an AI-powered business proposal generation platform with the following components and structure:

### **MAIN SYSTEM OVERVIEW:**

**System Name:** AI Proposal Backend System
**Purpose:** Automated business proposal generation from RFP documents using AI workflows

**High-Level Architecture (3-Tier):**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│  Frontend (Next.js 15 + React 19 + TypeScript)                │
│  ┌─────────────────┬─────────────────┬─────────────────┐       │
│  │   Dashboard     │   File Upload   │  Google Drive   │       │
│  │   Component     │   Component     │  Integration    │       │
│  └─────────────────┴─────────────────┴─────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                         HTTP/HTTPS
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  Backend API (Node.js + Express + TypeScript)                  │
│  ┌─────────────────┬─────────────────┬─────────────────┐       │
│  │   API Routes    │   Middleware    │   Controllers   │       │
│  │   (/api/*)      │   (Auth, CORS)  │   (Logic)       │       │
│  └─────────────────┴─────────────────┴─────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                         Service Calls
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│  │PDF Service  │OAuth Service│Project Svc  │AI Workflow  │    │
│  │(pdf-parse)  │(googleapis) │(Analysis)   │(LangGraph)  │    │
│  └─────────────┴─────────────┴─────────────┴─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                      External API Calls
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│  │  OpenAI     │Google Drive │Google OAuth │Google Docs  │    │
│  │  GPT-4      │    API      │   2.0 API   │    API      │    │
│  └─────────────┴─────────────┴─────────────┴─────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### **DETAILED COMPONENT BREAKDOWN:**

**Frontend Components (React/Next.js):**
- Landing Page with navigation
- Enhanced RFP Upload Component (with drag-drop)
- Google Drive Integration Component (OAuth + file browser)
- Proposal Dashboard (unified output display)
- Professional proposal viewer with tabs
- Export/sharing functionality

**Backend API Endpoints:**
- POST /api/upload-rfp (Standard processing)
- POST /api/upload-rfp-enhanced (Multi-document analysis)
- GET /api/auth/google (OAuth initiation)
- GET /api/auth/google/callback (OAuth callback)
- GET /api/drive/files (List Drive files)
- GET /api/drive/pdfs (List PDF files only)
- POST /api/drive/process-pdf (Process Drive PDF)
- GET /api/auth/status (Check auth status)
- POST /api/auth/logout (Logout)

**Service Layer Architecture:**
1. **PDF Service (pdfService.ts)**
   - Text extraction from PDF files
   - Content cleaning and validation
   - Health checks and error handling
   - Requirements extraction

2. **Google OAuth Service (googleOAuthService.ts)**
   - OAuth 2.0 authentication flow
   - Drive API integration
   - File listing and downloading
   - Token management

3. **Project Analysis Service (projectAnalysisService.ts)**
   - Multi-document context analysis
   - Project name detection
   - Related document discovery
   - Content synthesis

4. **AI Workflow Service (langgraphWorkflow.ts)**
   - LangGraph orchestration
   - 5-step proposal generation:
     * Analyze → Outline → Generate → Review → Finalize
   - State management between steps
   - Quality assurance

### **AI PROCESSING PIPELINE:**

**LangGraph Workflow (Visual Flow):**
```
Input (RFP) → [Analyze Node] → [Outline Node] → [Generate Node] → [Review Node] → [Finalize Node] → Output (Proposal)
     │              │               │               │              │               │
     ▼              ▼               ▼               ▼              ▼               ▼
Requirements   Analysis      Proposal       Draft         Quality        Final
Extraction     Results       Structure      Content       Review         Proposal
```

### **DATA FLOW ARCHITECTURE:**

**Standard Processing Flow:**
User → Upload PDF → Validation → Text Extraction → AI Analysis → Proposal Generation → Dashboard Storage

**Enhanced Processing Flow:**
User → Upload PDF → Project Detection → Google Drive Search → Multi-Doc Analysis → Enhanced AI Generation → Dashboard Storage

**Google Drive Flow:**
User → OAuth → Drive Access → File Selection → Download → Processing → AI Generation → Dashboard Storage

### **TECHNOLOGY STACK (Show in diagram):**

**Frontend Stack:**
- Next.js 15.2.4 (Framework)
- React 19.0.0 (UI Library)
- TypeScript 5.6.3 (Type Safety)
- Tailwind CSS 3.4.1 (Styling)
- Shadcn/UI Components (Design System)
- Axios (API Communication)

**Backend Stack:**
- Node.js 22+ (Runtime)
- Express.js 5.1.0 (Web Framework)
- TypeScript 5.6.3 (Type Safety)
- Multer 2.0.2 (File Upload)
- Express-session 1.18.2 (Session Management)

**AI/ML Stack:**
- @langchain/openai 0.6.3 (AI Integration)
- @langchain/langgraph 0.4.2 (Workflow Engine)
- OpenAI GPT-4 (Language Model)

**Document Processing:**
- pdf-parse 1.1.1 (PDF Text Extraction)
- Google Docs API (Document Export)

**Authentication & APIs:**
- Passport.js (Authentication Framework)
- Google OAuth 2.0 (User Authentication)
- Google Drive API (File Access)
- Google Docs API (Document Access)

### **SECURITY & COMPLIANCE LAYERS:**

**Security Measures:**
- Helmet.js (HTTP Security Headers)
- CORS Protection (Cross-Origin Control)
- Express-session (Secure Session Management)
- Environment Variables (Credential Protection)
- OAuth 2.0 (Secure Authentication)

**Data Protection:**
- Client-side Storage (Proposals in localStorage)
- No Sensitive Data Transmission
- Session-based Authentication
- Secure File Upload Validation

### **DEPLOYMENT ARCHITECTURE:**

**Development Environment:**
- Frontend: localhost:3001 (Next.js dev server)
- Backend: localhost:4000 (Express server)
- Hot reloading and development tools

**Production Considerations:**
- HTTPS Required (OAuth callbacks)
- Environment Variable Management
- Session Storage (Redis recommended)
- File Upload Limits and Validation
- API Rate Limiting

### **VISUAL STYLING REQUIREMENTS:**

**Color Scheme:**
- Primary: Blue gradients (#1e40af to #1d4ed8)
- Success: Green tones (#10b981)
- Warning: Orange tones (#f59e0b)
- Error: Red tones (#ef4444)
- Neutral: Gray tones (#6b7280)

**Diagram Style:**
- Modern, clean design
- Rounded corners and shadows
- Clear connection lines
- Professional color palette
- Icons for different service types
- Flow direction arrows
- Component grouping with containers

### **INTEGRATION POINTS (Show connections):**

1. **Frontend ↔ Backend:** HTTP/HTTPS REST API calls
2. **Backend ↔ OpenAI:** AI model integration for proposal generation
3. **Backend ↔ Google APIs:** OAuth, Drive, and Docs integration
4. **Components ↔ Storage:** localStorage for proposal persistence
5. **Services ↔ LangGraph:** AI workflow orchestration
6. **PDF Service ↔ AI Service:** Document processing pipeline

### **PERFORMANCE METRICS TO HIGHLIGHT:**

- PDF Processing: 2-5 seconds per document
- AI Generation: 30-60 seconds per proposal
- Drive Integration: 1-3 seconds per file lookup
- Multi-Document Analysis: 10-30 seconds
- Dashboard Load Time: < 2 seconds

---

**Generate a professional system architecture diagram showing all these components, their relationships, data flows, and technology stack. Use modern diagram conventions with clear visual hierarchy, proper grouping, and professional styling suitable for technical documentation.**
