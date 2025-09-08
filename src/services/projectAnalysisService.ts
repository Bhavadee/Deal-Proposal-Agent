import { GoogleOAuthService } from './googleOAuthService';
import { pdfService } from './pdfService';
import { langchainService } from './langchainService';

export interface ProjectDocument {
  id: string;
  name: string;
  mimeType: string;
  content: string;
  metadata: {
    size?: string;
    createdTime: string;
    modifiedTime: string;
    webViewLink: string;
    folderPath?: string;
  };
  documentType: 'rfp' | 'specification' | 'requirement' | 'design' | 'contract' | 'proposal' | 'other';
  relevanceScore: number;
}

export interface ProjectContext {
  projectName: string;
  rfpDocument: ProjectDocument;
  relatedDocuments: ProjectDocument[];
  totalDocuments: number;
  projectSummary: string;
  keyRequirements: string[];
  technicalSpecifications: string[];
  businessObjectives: string[];
  constraints: string[];
}

export class ProjectAnalysisService {
  private googleOAuth: GoogleOAuthService;

  constructor(googleOAuth: GoogleOAuthService) {
    this.googleOAuth = googleOAuth;
  }

  /**
   * Extract project name from RFP content using AI
   */
  async extractProjectName(rfpContent: string): Promise<string> {
    try {
      const projectNamePrompt = `
Analyze this RFP document and extract the project name or title. 
Return only the project name, nothing else.

RFP Content:
${rfpContent.substring(0, 2000)}...

Project Name:`;

      const response = await langchainService.generateProposal(projectNamePrompt);
      const projectName = response.trim().replace(/['"]/g, '').substring(0, 100);
      
      console.log('🏷️ Extracted Project Name:', projectName);
      return projectName;
    } catch (error) {
      console.error('Error extracting project name:', error);
      return 'Unknown Project';
    }
  }

  /**
   * Search for related project documents in Google Drive
   */
  async findProjectDocuments(projectName: string, rfpFileId?: string): Promise<any[]> {
    try {
      console.log('🔍 Searching for project documents related to:', projectName);

      // Generate multiple search queries
      const searchQueries = [
        `name contains '${projectName}'`,
        `fullText contains '${projectName}'`,
        `name contains '${projectName.split(' ')[0]}'`, // First word of project
        `name contains 'specification' or name contains 'requirement' or name contains 'design'`,
        `name contains 'proposal' or name contains 'contract' or name contains 'scope'`,
      ];

      const allFiles: any[] = [];
      const seenFileIds = new Set<string>();

      for (const query of searchQueries) {
        try {
          const result = await this.googleOAuth.listDriveFiles(undefined, query);
          if (result.files) {
            result.files.forEach((file: any) => {
              if (!seenFileIds.has(file.id) && file.id !== rfpFileId) {
                seenFileIds.add(file.id);
                allFiles.push(file);
              }
            });
          }
        } catch (error) {
          console.warn(`Search query failed: ${query}`, error);
        }
      }

      console.log(`📄 Found ${allFiles.length} potential project documents`);
      return allFiles;
    } catch (error) {
      console.error('Error searching for project documents:', error);
      return [];
    }
  }

  /**
   * Classify document type based on name and content
   */
  classifyDocumentType(fileName: string, content?: string): 'rfp' | 'specification' | 'requirement' | 'design' | 'contract' | 'proposal' | 'other' {
    const nameLower = fileName.toLowerCase();
    const contentLower = content?.toLowerCase() || '';

    if (nameLower.includes('rfp') || nameLower.includes('request for proposal')) return 'rfp';
    if (nameLower.includes('spec') || nameLower.includes('specification') || contentLower.includes('technical specification')) return 'specification';
    if (nameLower.includes('requirement') || contentLower.includes('requirements')) return 'requirement';
    if (nameLower.includes('design') || nameLower.includes('architecture') || contentLower.includes('system design')) return 'design';
    if (nameLower.includes('contract') || nameLower.includes('agreement') || contentLower.includes('terms and conditions')) return 'contract';
    if (nameLower.includes('proposal') || contentLower.includes('business proposal')) return 'proposal';
    
    return 'other';
  }

  /**
   * Calculate relevance score for a document
   */
  calculateRelevanceScore(projectName: string, fileName: string, content: string): number {
    let score = 0;
    const projectWords = projectName.toLowerCase().split(' ');
    const fileNameLower = fileName.toLowerCase();
    const contentLower = content.toLowerCase();

    // Name matching
    projectWords.forEach(word => {
      if (fileNameLower.includes(word)) score += 10;
      if (contentLower.includes(word)) score += 5;
    });

    // Document type relevance
    const relevantKeywords = ['specification', 'requirement', 'design', 'scope', 'objective', 'deliverable', 'milestone', 'budget', 'timeline'];
    relevantKeywords.forEach(keyword => {
      if (fileNameLower.includes(keyword)) score += 8;
      if (contentLower.includes(keyword)) score += 3;
    });

    // Recent documents get higher scores
    score += Math.random() * 5; // Add small random component to break ties

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Extract text content from various document types
   */
  async extractDocumentContent(file: any): Promise<string> {
    try {
      console.log(`📖 Extracting content from: ${file.name} (${file.mimeType})`);

      let content = '';

      if (file.mimeType === 'application/pdf') {
        const fileBuffer = await this.googleOAuth.downloadFile(file.id);
        const healthCheck = await pdfService.checkPDFHealth(fileBuffer);
        
        if (healthCheck.isHealthy) {
          content = await pdfService.extractTextFromPDF(fileBuffer);
        } else {
          console.warn(`PDF health issues for ${file.name}:`, healthCheck.issues);
          content = `[PDF extraction failed: ${healthCheck.issues.join(', ')}]`;
        }
      } else if (file.mimeType === 'application/vnd.google-apps.document') {
        // Google Docs - export as plain text
        try {
          const exportBuffer = await this.googleOAuth.exportGoogleDoc(file.id);
          content = exportBuffer.toString('utf-8');
        } catch (error) {
          content = `[Google Doc extraction failed: ${error}]`;
        }
      } else if (file.mimeType === 'text/plain' || file.mimeType.startsWith('text/')) {
        // Plain text files
        const fileBuffer = await this.googleOAuth.downloadFile(file.id);
        content = fileBuffer.toString('utf-8');
      } else {
        content = `[Unsupported file type: ${file.mimeType}]`;
      }

      console.log(`✅ Content extracted from ${file.name}: ${content.length} characters`);
      return content.substring(0, 10000); // Limit content size to prevent memory issues
    } catch (error) {
      console.error(`Error extracting content from ${file.name}:`, error);
      return `[Content extraction failed: ${error}]`;
    }
  }

  /**
   * Analyze all project documents and create comprehensive context
   */
  async analyzeProjectDocuments(rfpContent: string, rfpFileId?: string): Promise<ProjectContext> {
    try {
      console.log('🚀 Starting comprehensive project analysis...');

      // Step 1: Extract project name
      const projectName = await this.extractProjectName(rfpContent);

      // Step 2: Find related documents
      const relatedFiles = await this.findProjectDocuments(projectName, rfpFileId);

      // Step 3: Process each document
      const processedDocuments: ProjectDocument[] = [];

      for (const file of relatedFiles.slice(0, 10)) { // Limit to 10 most relevant docs
        try {
          const content = await this.extractDocumentContent(file);
          const documentType = this.classifyDocumentType(file.name, content);
          const relevanceScore = this.calculateRelevanceScore(projectName, file.name, content);

          const projectDoc: ProjectDocument = {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            content,
            metadata: {
              size: file.size,
              createdTime: file.createdTime,
              modifiedTime: file.modifiedTime,
              webViewLink: file.webViewLink,
            },
            documentType,
            relevanceScore
          };

          processedDocuments.push(projectDoc);
        } catch (error) {
          console.error(`Error processing document ${file.name}:`, error);
        }
      }

      // Step 4: Sort by relevance
      processedDocuments.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Step 5: Create RFP document object
      const rfpDocument: ProjectDocument = {
        id: rfpFileId || 'uploaded-rfp',
        name: 'RFP Document',
        mimeType: 'application/pdf',
        content: rfpContent,
        metadata: {
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          webViewLink: '',
        },
        documentType: 'rfp',
        relevanceScore: 100
      };

      // Step 6: Generate comprehensive project summary
      const projectSummary = await this.generateProjectSummary(projectName, rfpContent, processedDocuments);

      // Step 7: Extract structured information
      const keyRequirements = await this.extractKeyRequirements(processedDocuments);
      const technicalSpecs = await this.extractTechnicalSpecifications(processedDocuments);
      const businessObjectives = await this.extractBusinessObjectives(processedDocuments);
      const constraints = await this.extractConstraints(processedDocuments);

      const projectContext: ProjectContext = {
        projectName,
        rfpDocument,
        relatedDocuments: processedDocuments,
        totalDocuments: processedDocuments.length,
        projectSummary,
        keyRequirements,
        technicalSpecifications: technicalSpecs,
        businessObjectives,
        constraints
      };

      console.log('✅ Project analysis completed successfully');
      console.log(`📊 Project: ${projectName}`);
      console.log(`📁 Related Documents: ${processedDocuments.length}`);
      console.log(`📋 Key Requirements: ${keyRequirements.length}`);
      console.log(`🔧 Technical Specs: ${technicalSpecs.length}`);

      return projectContext;
    } catch (error) {
      console.error('Error analyzing project documents:', error);
      throw new Error('Failed to analyze project documents');
    }
  }

  /**
   * Generate comprehensive project summary from all documents
   */
  private async generateProjectSummary(projectName: string, rfpContent: string, documents: ProjectDocument[]): Promise<string> {
    try {
      const combinedContent = documents.slice(0, 5).map(doc => 
        `Document: ${doc.name}\nType: ${doc.documentType}\n${doc.content.substring(0, 1000)}...\n\n`
      ).join('');

      const summaryPrompt = `
Create a comprehensive project summary based on the RFP and related documents.

Project Name: ${projectName}

RFP Content:
${rfpContent.substring(0, 2000)}...

Related Documents:
${combinedContent}

Generate a detailed project summary that includes:
1. Project overview and scope
2. Main objectives
3. Key stakeholders
4. Technology requirements
5. Timeline expectations
6. Budget considerations
7. Success criteria

Summary:`;

      const summary = await langchainService.generateProposal(summaryPrompt);
      return summary.substring(0, 2000);
    } catch (error) {
      console.error('Error generating project summary:', error);
      return `Project: ${projectName}. Analysis of ${documents.length} related documents completed.`;
    }
  }

  /**
   * Extract key requirements from all documents
   */
  private async extractKeyRequirements(documents: ProjectDocument[]): Promise<string[]> {
    const requirements: string[] = [];
    
    documents.forEach(doc => {
      if (doc.documentType === 'requirement' || doc.documentType === 'specification') {
        const lines = doc.content.split('\n');
        lines.forEach(line => {
          if (line.toLowerCase().includes('requirement') || line.toLowerCase().includes('must') || line.toLowerCase().includes('shall')) {
            requirements.push(line.trim());
          }
        });
      }
    });

    return requirements.slice(0, 10); // Top 10 requirements
  }

  /**
   * Extract technical specifications
   */
  private async extractTechnicalSpecifications(documents: ProjectDocument[]): Promise<string[]> {
    const specs: string[] = [];
    
    documents.forEach(doc => {
      if (doc.documentType === 'specification' || doc.documentType === 'design') {
        const content = doc.content.toLowerCase();
        if (content.includes('technology') || content.includes('architecture') || content.includes('platform')) {
          specs.push(`From ${doc.name}: ${doc.content.substring(0, 200)}...`);
        }
      }
    });

    return specs.slice(0, 5);
  }

  /**
   * Extract business objectives
   */
  private async extractBusinessObjectives(documents: ProjectDocument[]): Promise<string[]> {
    const objectives: string[] = [];
    
    documents.forEach(doc => {
      const content = doc.content.toLowerCase();
      if (content.includes('objective') || content.includes('goal') || content.includes('outcome')) {
        const lines = doc.content.split('\n');
        lines.forEach(line => {
          if (line.toLowerCase().includes('objective') || line.toLowerCase().includes('goal')) {
            objectives.push(line.trim());
          }
        });
      }
    });

    return objectives.slice(0, 8);
  }

  /**
   * Extract constraints and limitations
   */
  private async extractConstraints(documents: ProjectDocument[]): Promise<string[]> {
    const constraints: string[] = [];
    
    documents.forEach(doc => {
      const content = doc.content.toLowerCase();
      if (content.includes('constraint') || content.includes('limitation') || content.includes('budget') || content.includes('timeline')) {
        const lines = doc.content.split('\n');
        lines.forEach(line => {
          if (line.toLowerCase().includes('constraint') || line.toLowerCase().includes('budget') || line.toLowerCase().includes('deadline')) {
            constraints.push(line.trim());
          }
        });
      }
    });

    return constraints.slice(0, 6);
  }
}

export const projectAnalysisService = new ProjectAnalysisService(new GoogleOAuthService());
