import express, { Request, Response } from 'express';
import multer from 'multer';
import { langchainService } from '../services/langchainService';
import { proposalWorkflow } from '../services/langgraphWorkflow';
import { pdfService } from '../services/pdfService';
import { GoogleOAuthService } from '../services/googleOAuthService';
import { ProjectAnalysisService } from '../services/projectAnalysisService';

const router = express.Router();

// Create OAuth service instance
const googleOAuthService = new GoogleOAuthService();
const projectAnalysisService = new ProjectAnalysisService(googleOAuthService);

// Debug endpoint to check environment variables
router.get('/debug/env', (req: Request, res: Response) => {
  res.json({
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...' : 'missing',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'missing',
    port: process.env.PORT || 'default',
    nodeEnv: process.env.NODE_ENV || 'default'
  });
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Handle multer errors
const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    if ((err.code as string) === 'UNEXPECTED_FIELD') {
      return res.status(400).json({ 
        error: 'Unexpected field name. Please use any field name for the PDF file.' 
      });
    }
    if ((err.code as string) === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err && err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

// Generate proposal using LangChain service
router.post('/generate-proposal', async (req: Request, res: Response) => {
  const { requirements } = req.body;

  if (!requirements) {
    return res.status(400).json({ error: 'Requirements are required' });
  }

  try {
    const proposal = await langchainService.generateProposal(requirements);
    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ error: 'Error generating proposal' });
  }
});

// Enhanced RFP processing with project context analysis
router.post('/upload-rfp-enhanced', upload.any(), handleMulterError, async (req: Request, res: Response) => {
  try {
    const tokens = (req as any).session?.tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated. Please login with Google first for enhanced project analysis.' });
    }

    googleOAuthService.setCredentials(tokens);

    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const file = files[0]; // Take the first file

    // Validate file is PDF
    if (!pdfService.validatePDFFile(file)) {
      return res.status(400).json({ error: 'Invalid file type. Only PDF files are accepted.' });
    }

    // Perform health check on PDF
    const healthCheck = await pdfService.checkPDFHealth(file.buffer);
    if (!healthCheck.isHealthy) {
      console.warn('PDF health issues detected:', healthCheck.issues);
      return res.status(400).json({ 
        error: 'PDF file appears to be corrupted or invalid', 
        details: healthCheck.issues.join(', ')
      });
    }

    // Extract text from PDF
    const extractedText = await pdfService.extractTextFromPDF(file.buffer);
    
    // Clean and extract requirements
    const requirements = pdfService.extractRFPRequirements(extractedText);

    if (!requirements || requirements.trim().length === 0) {
      return res.status(400).json({ error: 'No readable content found in the PDF' });
    }

    console.log('🚀 Starting enhanced project analysis...');

    // **NEW: Analyze project context using all related documents**
    const projectContext = await projectAnalysisService.analyzeProjectDocuments(requirements);

    // Generate enhanced prompt with project context
    const enhancedPrompt = `
Based on the RFP and comprehensive project analysis, generate a detailed business proposal.

PROJECT CONTEXT:
- Project Name: ${projectContext.projectName}
- Related Documents Analyzed: ${projectContext.totalDocuments}
- Project Summary: ${projectContext.projectSummary}

KEY REQUIREMENTS:
${projectContext.keyRequirements.map(req => `• ${req}`).join('\n')}

TECHNICAL SPECIFICATIONS:
${projectContext.technicalSpecifications.map(spec => `• ${spec}`).join('\n')}

BUSINESS OBJECTIVES:
${projectContext.businessObjectives.map(obj => `• ${obj}`).join('\n')}

CONSTRAINTS:
${projectContext.constraints.map(constraint => `• ${constraint}`).join('\n')}

RELATED DOCUMENTS ANALYZED:
${projectContext.relatedDocuments.map(doc => 
  `- ${doc.name} (${doc.documentType}) - Relevance: ${doc.relevanceScore.toFixed(1)}/100`
).join('\n')}

ORIGINAL RFP REQUIREMENTS:
${requirements}

Generate a comprehensive business proposal that addresses all requirements and leverages insights from all project documents.`;

    // Process through the enhanced proposal workflow
    const result = await proposalWorkflow.generateProposal(enhancedPrompt);

    res.json({
      message: 'Enhanced project-based business proposal generated successfully',
      originalFileName: file.originalname,
      projectContext: {
        projectName: projectContext.projectName,
        totalDocuments: projectContext.totalDocuments,
        documentsSummary: projectContext.relatedDocuments.map(doc => ({
          name: doc.name,
          type: doc.documentType,
          relevanceScore: doc.relevanceScore,
          size: doc.metadata.size
        })),
        projectSummary: projectContext.projectSummary,
        keyInsights: {
          requirements: projectContext.keyRequirements.length,
          technicalSpecs: projectContext.technicalSpecifications.length,
          businessObjectives: projectContext.businessObjectives.length,
          constraints: projectContext.constraints.length
        }
      },
      processingInfo: {
        extractedRequirementsWordCount: requirements.split(' ').length,
        enhancedPromptWordCount: enhancedPrompt.split(' ').length,
        analysisCompleted: true,
        outlineGenerated: true,
        proposalGenerated: true,
        reviewCompleted: true,
        finalized: true,
        enhancedWithProjectContext: true
      },
      extractedRequirements: requirements.substring(0, 500) + '...', // Preview
      businessProposal: {
        summary: 'Enhanced business proposal generated with comprehensive project context',
        analysis: result.analysis,
        outline: result.outline.substring(0, 1000) + '...', // Preview
        fullProposal: result.fullProposal,
        review: result.review.substring(0, 1000) + '...', // Preview
        finalProposal: result.finalProposal,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingSteps: ['project-analysis', 'context-integration', 'analyze', 'outline', 'generate', 'review', 'finalize'],
          proposalLength: result.finalProposal.length,
          estimatedReadingTime: Math.ceil(result.finalProposal.split(' ').length / 200) + ' minutes',
          enhancementLevel: 'comprehensive-project-context'
        }
      }
    });

    console.log('Enhanced RFP processed successfully:', file.originalname);
    console.log('Project:', projectContext.projectName);
    console.log('Related Documents:', projectContext.totalDocuments);
    
    // Log complete enhanced processing results
    console.log('\n' + '='.repeat(80));
    console.log('📊 ENHANCED PROJECT-BASED PROPOSAL RESULTS');
    console.log('='.repeat(80));
    
    console.log('\n🏷️ PROJECT INFORMATION:');
    console.log('-'.repeat(50));
    console.log('Project Name:', projectContext.projectName);
    console.log('Total Documents Analyzed:', projectContext.totalDocuments);
    
    console.log('\n📁 RELATED DOCUMENTS:');
    console.log('-'.repeat(50));
    projectContext.relatedDocuments.forEach(doc => {
      console.log(`• ${doc.name} (${doc.documentType}) - Relevance: ${doc.relevanceScore.toFixed(1)}/100`);
    });
    
    console.log('\n📋 PROJECT SUMMARY:');
    console.log('-'.repeat(50));
    console.log(projectContext.projectSummary);
    
    console.log('\n✅ FINAL ENHANCED PROPOSAL:');
    console.log('-'.repeat(50));
    console.log(result.finalProposal);
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ ENHANCED PROJECT ANALYSIS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error processing enhanced RFP:', error);
    res.status(500).json({ 
      error: 'Error processing enhanced RFP with project context',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload and process RFP PDF document
router.post('/upload-rfp', upload.any(), handleMulterError, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const file = files[0]; // Take the first file

    // Validate file is PDF
    if (!pdfService.validatePDFFile(file)) {
      return res.status(400).json({ error: 'Invalid file type. Only PDF files are accepted.' });
    }

    // Perform health check on PDF
    const healthCheck = await pdfService.checkPDFHealth(file.buffer);
    if (!healthCheck.isHealthy) {
      console.warn('PDF health issues detected:', healthCheck.issues);
      return res.status(400).json({ 
        error: 'PDF file appears to be corrupted or invalid', 
        details: healthCheck.issues.join(', ')
      });
    }

    // Extract text from PDF
    const extractedText = await pdfService.extractTextFromPDF(file.buffer);
    
    // Clean and extract requirements
    const requirements = pdfService.extractRFPRequirements(extractedText);

    if (!requirements || requirements.trim().length === 0) {
      return res.status(400).json({ error: 'No readable content found in the PDF' });
    }

    // Process through the proposal workflow
    const result = await proposalWorkflow.generateProposal(requirements);

    res.json({
      message: 'Comprehensive business proposal generated successfully',
      originalFileName: file.originalname,
      processingInfo: {
        extractedRequirementsWordCount: requirements.split(' ').length,
        analysisCompleted: true,
        outlineGenerated: true,
        proposalGenerated: true,
        reviewCompleted: true,
        finalized: true
      },
      extractedRequirements: requirements.substring(0, 500) + '...', // Preview
      businessProposal: {
        summary: 'Comprehensive business proposal generated through AI workflow',
        analysis: result.analysis,
        outline: result.outline.substring(0, 1000) + '...', // Preview
        fullProposal: result.fullProposal,
        review: result.review.substring(0, 1000) + '...', // Preview
        finalProposal: result.finalProposal,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingSteps: ['analyze', 'outline', 'generate', 'review', 'finalize'],
          proposalLength: result.finalProposal.length,
          estimatedReadingTime: Math.ceil(result.finalProposal.split(' ').length / 200) + ' minutes'
        }
      }
    });

    console.log('RFP processed successfully:', file.originalname);
    console.log('Extracted Requirements Preview:', requirements.substring(0, 500) + '...');
    
    // Log complete processing results
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPLETE PROPOSAL PROCESSING RESULTS');
    console.log('='.repeat(80));
    
    console.log('\n📋 1. EXTRACTED REQUIREMENTS:');
    console.log('-'.repeat(50));
    console.log(requirements);
    
    console.log('\n🔍 2. ANALYSIS RESULTS:');
    console.log('-'.repeat(50));
    console.log(JSON.stringify(result.analysis, null, 2));
    
    console.log('\n📝 3. PROPOSAL OUTLINE:');
    console.log('-'.repeat(50));
    console.log(result.outline);
    
    console.log('\n📄 4. FULL PROPOSAL:');
    console.log('-'.repeat(50));
    console.log(result.fullProposal);
    
    console.log('\n🔍 5. REVIEW FEEDBACK:');
    console.log('-'.repeat(50));
    console.log(result.review);
    
    console.log('\n✅ 6. FINAL BUSINESS PROPOSAL:');
    console.log('-'.repeat(50));
    console.log(result.finalProposal);
    
    console.log('\n📊 7. PROCESSING METADATA:');
    console.log('-'.repeat(50));
    console.log('Requirements Word Count:', requirements.split(' ').length);
    console.log('Final Proposal Word Count:', result.finalProposal.split(' ').length);
    console.log('Final Proposal Character Count:', result.finalProposal.length);
    console.log('Estimated Reading Time:', Math.ceil(result.finalProposal.split(' ').length / 200) + ' minutes');
    console.log('Processing Steps Completed: analyze → outline → generate → review → finalize');
    console.log('Generated At:', new Date().toISOString());
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ PROPOSAL PROCESSING COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error processing RFP PDF:', error);
    res.status(500).json({ 
      error: 'Error processing RFP document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Extract requirements from PDF (without generating proposal)
router.post('/extract-rfp', upload.any(), handleMulterError, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const file = files[0]; // Take the first file

    // Validate file is PDF
    if (!pdfService.validatePDFFile(file)) {
      return res.status(400).json({ error: 'Invalid file type. Only PDF files are accepted.' });
    }

    // Perform health check on PDF
    const healthCheck = await pdfService.checkPDFHealth(file.buffer);
    if (!healthCheck.isHealthy) {
      console.warn('PDF health issues detected:', healthCheck.issues);
      return res.status(400).json({ 
        error: 'PDF file appears to be corrupted or invalid', 
        details: healthCheck.issues.join(', ')
      });
    }

    // Extract text from PDF
    const extractedText = await pdfService.extractTextFromPDF(file.buffer);
    
    // Clean and extract requirements
    const requirements = pdfService.extractRFPRequirements(extractedText);

    if (!requirements || requirements.trim().length === 0) {
      return res.status(400).json({ error: 'No readable content found in the PDF' });
    }

    res.json({
      message: 'Requirements extracted successfully',
      originalFileName: file.originalname,
      extractedRequirements: requirements,
      wordCount: requirements.split(' ').length
    });

  } catch (error) {
    console.error('Error extracting requirements from PDF:', error);
    res.status(500).json({ 
      error: 'Error extracting requirements from PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Analyze requirements using LangGraph workflow
router.post('/analyze-requirements', async (req: Request, res: Response) => {
  const { requirements } = req.body;

  if (!requirements) {
    return res.status(400).json({ error: 'Requirements are required' });
  }

  try {
    const analysis = await langchainService.analyzeRequirements(requirements);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: 'Error analyzing requirements' });
  }
});

// PDF diagnostic endpoint
router.post('/diagnose-pdf', upload.any(), handleMulterError, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const file = files[0];
    
    // Basic file info
    const fileInfo = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      sizeFormatted: `${(file.size / 1024).toFixed(2)} KB`
    };

    // PDF validation
    const isValidPDF = pdfService.validatePDFFile(file);
    
    // Health check
    const healthCheck = await pdfService.checkPDFHealth(file.buffer);
    
    // Try to extract a small sample of text
    let textSample = 'Could not extract text';
    let extractionError = null;
    
    try {
      const fullText = await pdfService.extractTextFromPDF(file.buffer);
      textSample = fullText.substring(0, 200) + (fullText.length > 200 ? '...' : '');
    } catch (error) {
      extractionError = error instanceof Error ? error.message : 'Unknown error';
    }

    res.json({
      message: 'PDF diagnostic completed',
      fileInfo,
      isValidPDF,
      healthCheck,
      textSample,
      extractionError,
      recommendations: healthCheck.isHealthy 
        ? ['PDF appears to be healthy and should process correctly']
        : [
            'Try using a different PDF file',
            'Ensure the PDF is not password-protected',
            'Check if the PDF was created properly',
            'Try converting the PDF using a different tool'
          ]
    });

  } catch (error) {
    console.error('Error diagnosing PDF:', error);
    res.status(500).json({ 
      error: 'Error diagnosing PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Full Proposal workflow using LangGraph
router.post('/workflow-proposal', async (req: Request, res: Response) => {
  const { requirements } = req.body;

  if (!requirements) {
    return res.status(400).json({ error: 'Requirements are required' });
  }

  try {
    const result = await proposalWorkflow.generateProposal(requirements);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error generating proposal via workflow' });
  }
});

// Generate formatted proposal document
router.post('/generate-document', async (req: Request, res: Response) => {
  const { requirements, format = 'text' } = req.body;

  if (!requirements) {
    return res.status(400).json({ error: 'Requirements are required' });
  }

  try {
    console.log('🚀 Starting comprehensive proposal document generation...');
    const result = await proposalWorkflow.generateProposal(requirements);
    
    // Format the final proposal as a structured document
    const documentHeader = `
BUSINESS PROPOSAL DOCUMENT
Generated: ${new Date().toLocaleDateString()}
Project: RFP Response
==================================================

`;

    const structuredDocument = documentHeader + result.finalProposal;
    
    if (format === 'json') {
      res.json({
        message: 'Comprehensive business proposal document generated',
        document: {
          header: documentHeader.trim(),
          content: result.finalProposal,
          metadata: {
            generatedAt: new Date().toISOString(),
            wordCount: result.finalProposal.split(' ').length,
            characterCount: result.finalProposal.length,
            estimatedPages: Math.ceil(result.finalProposal.split(' ').length / 250),
            processingSteps: ['analyze', 'outline', 'generate', 'review', 'finalize']
          },
          analysis: result.analysis,
          outline: result.outline,
          review: result.review
        }
      });
    } else {
      // Return as plain text document
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="business-proposal.txt"');
      res.send(structuredDocument);
    }
    
    console.log('✅ Document generation completed successfully');
    
  } catch (error) {
    console.error('Error generating proposal document:', error);
    res.status(500).json({ 
      error: 'Error generating proposal document',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Google OAuth endpoints
// Start Google OAuth flow
router.get('/auth/google', (req: Request, res: Response) => {
  const authUrl = googleOAuthService.getAuthUrl();
  res.json({ authUrl });
});

// Google OAuth callback
router.get('/auth/google/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const tokens = await googleOAuthService.getTokens(code);
    googleOAuthService.setCredentials(tokens);
    
    // Get user profile
    const userProfile = await googleOAuthService.getUserProfile();

    // Store tokens in session (in production, use secure storage)
    (req as any).session = (req as any).session || {};
    (req as any).session.tokens = tokens;
    (req as any).session.user = userProfile;

    res.json({
      message: 'Google OAuth successful',
      user: userProfile,
      hasAccess: true
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'OAuth authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List Google Drive files
router.get('/drive/files', async (req: Request, res: Response) => {
  try {
    const tokens = (req as any).session?.tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated. Please login with Google first.' });
    }

    googleOAuthService.setCredentials(tokens);
    
    const { pageToken, search } = req.query;
    const files = await googleOAuthService.listDriveFiles(
      pageToken as string, 
      search as string
    );

    res.json({
      message: 'Files retrieved successfully',
      files: files.files,
      nextPageToken: files.nextPageToken
    });
  } catch (error) {
    console.error('Error listing Drive files:', error);
    res.status(500).json({ 
      error: 'Failed to list Google Drive files',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search PDF files in Google Drive
router.get('/drive/pdfs', async (req: Request, res: Response) => {
  try {
    const tokens = (req as any).session?.tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated. Please login with Google first.' });
    }

    googleOAuthService.setCredentials(tokens);
    
    const { search } = req.query;
    const files = await googleOAuthService.searchPDFFiles(search as string);

    res.json({
      message: 'PDF files retrieved successfully',
      files: files.files,
      nextPageToken: files.nextPageToken
    });
  } catch (error) {
    console.error('Error searching PDF files:', error);
    res.status(500).json({ 
      error: 'Failed to search PDF files in Google Drive',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced Google Drive PDF processing with project context
router.post('/drive/process-pdf-enhanced', async (req: Request, res: Response) => {
  try {
    const tokens = (req as any).session?.tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated. Please login with Google first.' });
    }

    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    googleOAuthService.setCredentials(tokens);

    // Get file metadata
    const fileMetadata = await googleOAuthService.getFileMetadata(fileId);
    
    // Validate it's a PDF
    if (fileMetadata.mimeType !== 'application/pdf') {
      return res.status(400).json({ error: 'Selected file is not a PDF' });
    }

    // Download the file
    const fileBuffer = await googleOAuthService.downloadFile(fileId);
    
    // Process the PDF
    const healthCheck = await pdfService.checkPDFHealth(fileBuffer);
    if (!healthCheck.isHealthy) {
      console.warn('PDF health issues detected:', healthCheck.issues);
      return res.status(400).json({ 
        error: 'PDF file appears to be corrupted or invalid', 
        details: healthCheck.issues.join(', ')
      });
    }

    // Extract text from PDF
    const extractedText = await pdfService.extractTextFromPDF(fileBuffer);
    
    // Clean and extract requirements
    const requirements = pdfService.extractRFPRequirements(extractedText);

    if (!requirements || requirements.trim().length === 0) {
      return res.status(400).json({ error: 'No readable content found in the PDF' });
    }

    console.log('🚀 Starting enhanced Google Drive project analysis...');

    // **NEW: Analyze project context using all related documents**
    const projectContext = await projectAnalysisService.analyzeProjectDocuments(requirements, fileId);

    // Generate enhanced prompt with project context
    const enhancedPrompt = `
Based on the Google Drive RFP and comprehensive project analysis, generate a detailed business proposal.

PROJECT CONTEXT:
- Project Name: ${projectContext.projectName}
- Source File: ${fileMetadata.name}
- Related Documents Analyzed: ${projectContext.totalDocuments}
- Project Summary: ${projectContext.projectSummary}

KEY REQUIREMENTS:
${projectContext.keyRequirements.map(req => `• ${req}`).join('\n')}

TECHNICAL SPECIFICATIONS:
${projectContext.technicalSpecifications.map(spec => `• ${spec}`).join('\n')}

BUSINESS OBJECTIVES:
${projectContext.businessObjectives.map(obj => `• ${obj}`).join('\n')}

CONSTRAINTS:
${projectContext.constraints.map(constraint => `• ${constraint}`).join('\n')}

RELATED DOCUMENTS ANALYZED:
${projectContext.relatedDocuments.map(doc => 
  `- ${doc.name} (${doc.documentType}) - Relevance: ${doc.relevanceScore.toFixed(1)}/100`
).join('\n')}

ORIGINAL RFP REQUIREMENTS:
${requirements}

Generate a comprehensive business proposal that addresses all requirements and leverages insights from all project documents.`;

    // Process through the enhanced proposal workflow
    const result = await proposalWorkflow.generateProposal(enhancedPrompt);

    res.json({
      message: 'Enhanced Google Drive project-based proposal generated successfully',
      originalFileName: fileMetadata.name,
      fileId: fileId,
      projectContext: {
        projectName: projectContext.projectName,
        totalDocuments: projectContext.totalDocuments,
        documentsSummary: projectContext.relatedDocuments.map(doc => ({
          name: doc.name,
          type: doc.documentType,
          relevanceScore: doc.relevanceScore,
          driveLink: doc.metadata.webViewLink
        })),
        projectSummary: projectContext.projectSummary
      },
      processingInfo: {
        extractedRequirementsWordCount: requirements.split(' ').length,
        enhancedPromptWordCount: enhancedPrompt.split(' ').length,
        analysisCompleted: true,
        outlineGenerated: true,
        proposalGenerated: true,
        reviewCompleted: true,
        finalized: true,
        enhancedWithProjectContext: true
      },
      extractedRequirements: requirements.substring(0, 500) + '...', // Preview
      businessProposal: {
        summary: 'Enhanced business proposal generated from Google Drive with comprehensive project context',
        analysis: result.analysis,
        outline: result.outline.substring(0, 1000) + '...', // Preview
        fullProposal: result.fullProposal,
        review: result.review.substring(0, 1000) + '...', // Preview
        finalProposal: result.finalProposal,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingSteps: ['project-analysis', 'context-integration', 'analyze', 'outline', 'generate', 'review', 'finalize'],
          proposalLength: result.finalProposal.length,
          estimatedReadingTime: Math.ceil(result.finalProposal.split(' ').length / 200) + ' minutes',
          enhancementLevel: 'comprehensive-project-context',
          sourceFile: {
            name: fileMetadata.name,
            size: fileMetadata.size,
            driveId: fileId,
            webViewLink: fileMetadata.webViewLink
          }
        }
      }
    });

    console.log('Enhanced Google Drive project analysis completed:', fileMetadata.name);

  } catch (error) {
    console.error('Error processing enhanced Google Drive PDF:', error);
    res.status(500).json({ 
      error: 'Error processing enhanced Google Drive PDF with project context',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download and process PDF from Google Drive
router.post('/drive/process-pdf', async (req: Request, res: Response) => {
  try {
    const tokens = (req as any).session?.tokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not authenticated. Please login with Google first.' });
    }

    const { fileId } = req.body;
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }

    googleOAuthService.setCredentials(tokens);

    // Get file metadata
    const fileMetadata = await googleOAuthService.getFileMetadata(fileId);
    
    // Validate it's a PDF
    if (fileMetadata.mimeType !== 'application/pdf') {
      return res.status(400).json({ error: 'Selected file is not a PDF' });
    }

    // Download the file
    const fileBuffer = await googleOAuthService.downloadFile(fileId);
    
    // Process the PDF similar to upload-rfp endpoint
    const healthCheck = await pdfService.checkPDFHealth(fileBuffer);
    if (!healthCheck.isHealthy) {
      console.warn('PDF health issues detected:', healthCheck.issues);
      return res.status(400).json({ 
        error: 'PDF file appears to be corrupted or invalid', 
        details: healthCheck.issues.join(', ')
      });
    }

    // Extract text from PDF
    const extractedText = await pdfService.extractTextFromPDF(fileBuffer);
    
    // Clean and extract requirements
    const requirements = pdfService.extractRFPRequirements(extractedText);

    if (!requirements || requirements.trim().length === 0) {
      return res.status(400).json({ error: 'No readable content found in the PDF' });
    }

    // Process through the proposal workflow
    const result = await proposalWorkflow.generateProposal(requirements);

    res.json({
      message: 'Google Drive RFP processed successfully',
      originalFileName: fileMetadata.name,
      fileId: fileId,
      processingInfo: {
        extractedRequirementsWordCount: requirements.split(' ').length,
        analysisCompleted: true,
        outlineGenerated: true,
        proposalGenerated: true,
        reviewCompleted: true,
        finalized: true
      },
      extractedRequirements: requirements.substring(0, 500) + '...', // Preview
      businessProposal: {
        summary: 'Comprehensive business proposal generated from Google Drive PDF',
        analysis: result.analysis,
        outline: result.outline.substring(0, 1000) + '...', // Preview
        fullProposal: result.fullProposal,
        review: result.review.substring(0, 1000) + '...', // Preview
        finalProposal: result.finalProposal,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingSteps: ['analyze', 'outline', 'generate', 'review', 'finalize'],
          proposalLength: result.finalProposal.length,
          estimatedReadingTime: Math.ceil(result.finalProposal.split(' ').length / 200) + ' minutes',
          sourceFile: {
            name: fileMetadata.name,
            size: fileMetadata.size,
            driveId: fileId,
            webViewLink: fileMetadata.webViewLink
          }
        }
      }
    });

    console.log('Google Drive RFP processed successfully:', fileMetadata.name);
    console.log('File ID:', fileId);

  } catch (error) {
    console.error('Error processing Google Drive PDF:', error);
    res.status(500).json({ 
      error: 'Error processing Google Drive PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check authentication status
router.get('/auth/status', (req: Request, res: Response) => {
  const tokens = (req as any).session?.tokens;
  const user = (req as any).session?.user;

  if (tokens && user) {
    res.json({
      authenticated: true,
      user: user,
      hasGoogleDriveAccess: true
    });
  } else {
    res.json({
      authenticated: false,
      user: null,
      hasGoogleDriveAccess: false
    });
  }
});

// Logout
router.post('/auth/logout', (req: Request, res: Response) => {
  (req as any).session = null;
  res.json({ message: 'Logged out successfully' });
});

export default router;
