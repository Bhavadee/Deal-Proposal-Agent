# AI Proposal Backend - RFP PDF Processing

This backend service now supports processing RFP (Request for Proposal) PDF documents and generating proposals using AI.

## New API Endpoints

### 1. Upload and Process RFP PDF
**POST** `/api/upload-rfp`

Upload an RFP PDF document and get a complete AI-generated proposal.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `rfpDocument` field containing the PDF file

**Response:**
```json
{
  "message": "RFP processed successfully",
  "originalFileName": "sample-rfp.pdf",
  "extractedRequirements": "Requirements preview...",
  "proposal": {
    "requirements": "Full extracted requirements",
    "analysis": { "keywords": [...], "complexity": "medium" },
    "outline": "Generated outline",
    "fullProposal": "Complete proposal",
    "review": "Review feedback",
    "finalProposal": "Final polished proposal"
  }
}
```

### 2. Extract Requirements from RFP PDF
**POST** `/api/extract-rfp`

Extract and clean requirements from an RFP PDF without generating a proposal.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `rfpDocument` field containing the PDF file

**Response:**
```json
{
  "message": "Requirements extracted successfully",
  "originalFileName": "sample-rfp.pdf",
  "extractedRequirements": "Full extracted text",
  "wordCount": 1250
}
```

## Existing Endpoints

### 3. Generate Proposal from Text
**POST** `/api/generate-proposal`

Generate a simple proposal from text requirements.

### 4. Workflow Proposal from Text
**POST** `/api/workflow-proposal`

Generate a complete proposal using the LangGraph workflow from text requirements.

### 5. Analyze Requirements
**POST** `/api/analyze-requirements`

Analyze text requirements and extract key information.

## File Upload Specifications

- **Supported formats:** PDF only
- **Maximum file size:** 10MB
- **File validation:** Automatic PDF format validation
- **Processing:** Text extraction, cleaning, and requirement identification

## Workflow Process

1. **PDF Upload** → File validation and text extraction
2. **Text Processing** → Clean and extract requirements
3. **AI Analysis** → Analyze requirements for keywords, complexity, etc.
4. **Outline Generation** → Create structured proposal outline
5. **Proposal Generation** → Generate comprehensive proposal
6. **Review Process** → AI review and feedback
7. **Final Polish** → Create final polished version

## Error Handling

The API includes comprehensive error handling for:
- Invalid file types
- Corrupted PDF files
- Large file sizes
- Empty or unreadable PDFs
- AI processing errors
