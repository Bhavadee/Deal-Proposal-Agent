import pdfParse from 'pdf-parse';

export class PDFService {
  /**
   * Extract text content from a PDF buffer
   */
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      // Try with default options first
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.warn('Primary PDF parsing failed, trying with fallback options:', error);
      
      try {
        // Try with more lenient options
        const data = await pdfParse(buffer, {
          // Limit the number of pages to process (0 = all pages)
          max: 0,
          // Version to use
          version: 'v1.10.100'
        });
        return data.text;
      } catch (fallbackError) {
        console.warn('Fallback PDF parsing also failed:', fallbackError);
        
        try {
          // Last resort: try to parse with minimal options
          const data = await pdfParse(buffer, { max: 1 });
          if (data.text && data.text.trim().length > 0) {
            return data.text;
          }
          throw new Error('No text content found in PDF');
        } catch (finalError) {
          console.error('All PDF parsing attempts failed:', finalError);
          throw new Error(`Failed to parse PDF document. The file may be corrupted, password-protected, or in an unsupported format. Details: ${finalError instanceof Error ? finalError.message : 'Unknown error'}`);
        }
      }
    }
  }

  /**
   * Extract and clean RFP requirements from PDF text
   */
  extractRFPRequirements(text: string): string {
    // Remove excessive whitespace and normalize line breaks
    let cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Remove common PDF artifacts
    cleanText = cleanText.replace(/\f/g, ' '); // Form feed characters
    cleanText = cleanText.replace(/[\x00-\x1F\x7F]/g, ' '); // Control characters
    
    // Try to identify key sections that typically contain requirements
    const requirementSections = [
      'requirements',
      'scope of work',
      'project description',
      'deliverables',
      'specifications',
      'objectives',
      'goals',
      'expectations'
    ];

    // Extract relevant sections (basic implementation)
    const sections: string[] = [];
    const lowerText = cleanText.toLowerCase();
    
    requirementSections.forEach(section => {
      const sectionIndex = lowerText.indexOf(section);
      if (sectionIndex !== -1) {
        // Extract a reasonable chunk after finding the section
        const sectionText = cleanText.substring(sectionIndex, sectionIndex + 2000);
        sections.push(sectionText);
      }
    });

    // If we found specific sections, use them; otherwise use the full text
    const extractedText = sections.length > 0 ? sections.join('\n\n') : cleanText;
    
    // Limit the text length to avoid token limits
    return extractedText.length > 10000 ? extractedText.substring(0, 10000) + '...' : extractedText;
  }

  /**
   * Validate that the uploaded file is a PDF and check basic structure
   */
  validatePDFFile(file: Express.Multer.File): boolean {
    // Check MIME type
    if (file.mimetype !== 'application/pdf') {
      return false;
    }
    
    // Check file extension
    const fileName = file.originalname.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      return false;
    }
    
    // Check PDF magic number (basic PDF header validation)
    const buffer = file.buffer;
    if (buffer.length < 5) {
      return false;
    }
    
    // PDF files should start with %PDF-
    const header = buffer.subarray(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      console.warn('File does not have valid PDF header:', header);
      return false;
    }
    
    return true;
  }

  /**
   * Additional PDF health check
   */
  async checkPDFHealth(buffer: Buffer): Promise<{ isHealthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Check if buffer is valid
      if (!buffer || buffer.length === 0) {
        issues.push('Empty or null buffer');
        return { isHealthy: false, issues };
      }
      
      // Check minimum size
      if (buffer.length < 100) {
        issues.push('File too small to be a valid PDF');
        return { isHealthy: false, issues };
      }
      
      // Check PDF header
      const header = buffer.subarray(0, 8).toString('ascii');
      if (!header.startsWith('%PDF-')) {
        issues.push('Invalid PDF header');
        return { isHealthy: false, issues };
      }
      
      // Check for PDF trailer
      const trailer = buffer.subarray(-50).toString('ascii');
      if (!trailer.includes('%%EOF')) {
        issues.push('Missing or corrupted PDF trailer');
      }
      
      // Check for common PDF structure
      const content = buffer.toString('ascii');
      if (!content.includes('obj') && !content.includes('endobj')) {
        issues.push('Missing PDF object structure');
      }
      
      return { isHealthy: issues.length === 0, issues };
      
    } catch (error) {
      issues.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isHealthy: false, issues };
    }
  }
}

export const pdfService = new PDFService();
