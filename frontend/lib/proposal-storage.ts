// Utility for managing proposal storage and retrieval
export interface ProposalData {
  id: string
  title: string
  clientName: string
  projectType: string
  status: 'draft' | 'review' | 'completed' | 'sent'
  createdAt: string
  lastModified: string
  source: 'upload' | 'drive' | 'enhanced'
  
  // Main content
  extractedRequirements: string
  businessProposal: {
    summary: string
    analysis: any
    outline: string
    fullProposal: string
    review: string
    finalProposal: string
    metadata: {
      generatedAt: string
      processingSteps: string[]
      proposalLength: number
      estimatedReadingTime: string
      wordCount: number
      sourceFile?: {
        name: string
        size?: string
        driveId?: string
        webViewLink?: string
      }
    }
  }
  
  // Processing info
  processingInfo: {
    extractedRequirementsWordCount: number
    analysisCompleted: boolean
    outlineGenerated: boolean
    proposalGenerated: boolean
    reviewCompleted: boolean
    finalized: boolean
  }
}

class ProposalStorageService {
  private storageKey = 'generatedProposals'
  
  /**
   * Store a new proposal
   */
  storeProposal(proposalData: any): ProposalData {
    const proposals = this.getAllProposals()
    
    // Transform the API response to our ProposalData format
    const proposal: ProposalData = {
      id: this.generateId(),
      title: this.extractTitle(proposalData),
      clientName: this.extractClientName(proposalData),
      projectType: this.extractProjectType(proposalData),
      status: 'completed',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      source: this.detectSource(proposalData),
      
      extractedRequirements: proposalData.extractedRequirements || '',
      businessProposal: {
        summary: proposalData.businessProposal?.summary || proposalData.businessProposal?.analysis || '',
        analysis: proposalData.businessProposal?.analysis || proposalData.analysis || {},
        outline: proposalData.businessProposal?.outline || proposalData.outline || '',
        fullProposal: proposalData.businessProposal?.fullProposal || proposalData.proposal || '',
        review: proposalData.businessProposal?.review || proposalData.review || '',
        finalProposal: proposalData.businessProposal?.finalProposal || proposalData.businessProposal?.fullProposal || proposalData.proposal || '',
        metadata: {
          generatedAt: proposalData.businessProposal?.metadata?.generatedAt || new Date().toISOString(),
          processingSteps: proposalData.businessProposal?.metadata?.processingSteps || ['analyze', 'outline', 'generate', 'review', 'finalize'],
          proposalLength: proposalData.businessProposal?.metadata?.proposalLength || 0,
          estimatedReadingTime: proposalData.businessProposal?.metadata?.estimatedReadingTime || '5 minutes',
          wordCount: proposalData.businessProposal?.metadata?.wordCount || this.countWords(proposalData.businessProposal?.finalProposal || ''),
          sourceFile: proposalData.businessProposal?.metadata?.sourceFile
        }
      },
      
      processingInfo: {
        extractedRequirementsWordCount: proposalData.processingInfo?.extractedRequirementsWordCount || 0,
        analysisCompleted: proposalData.processingInfo?.analysisCompleted ?? true,
        outlineGenerated: proposalData.processingInfo?.outlineGenerated ?? true,
        proposalGenerated: proposalData.processingInfo?.proposalGenerated ?? true,
        reviewCompleted: proposalData.processingInfo?.reviewCompleted ?? true,
        finalized: proposalData.processingInfo?.finalized ?? true
      }
    }
    
    proposals.push(proposal)
    localStorage.setItem(this.storageKey, JSON.stringify(proposals))
    
    return proposal
  }
  
  /**
   * Get all stored proposals
   */
  getAllProposals(): ProposalData[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error retrieving proposals:', error)
      return []
    }
  }
  
  /**
   * Get a specific proposal by ID
   */
  getProposal(id: string): ProposalData | null {
    const proposals = this.getAllProposals()
    return proposals.find(p => p.id === id) || null
  }
  
  /**
   * Delete a proposal
   */
  deleteProposal(id: string): boolean {
    const proposals = this.getAllProposals()
    const filteredProposals = proposals.filter(p => p.id !== id)
    
    if (filteredProposals.length < proposals.length) {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredProposals))
      return true
    }
    
    return false
  }
  
  /**
   * Update a proposal
   */
  updateProposal(id: string, updates: Partial<ProposalData>): ProposalData | null {
    const proposals = this.getAllProposals()
    const index = proposals.findIndex(p => p.id === id)
    
    if (index !== -1) {
      proposals[index] = {
        ...proposals[index],
        ...updates,
        lastModified: new Date().toISOString()
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(proposals))
      return proposals[index]
    }
    
    return null
  }
  
  /**
   * Clear all proposals
   */
  clearAll(): void {
    localStorage.removeItem(this.storageKey)
  }
  
  // Helper methods
  private generateId(): string {
    return `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private extractTitle(data: any): string {
    // Try to extract a meaningful title from the proposal
    const text = data.businessProposal?.finalProposal || data.proposal || data.extractedRequirements || ''
    
    // Look for common title patterns
    const lines = text.split('\n').filter((line: string) => line.trim())
    if (lines.length > 0) {
      const firstLine = lines[0].replace(/[#*\-=]/g, '').trim()
      if (firstLine.length > 10 && firstLine.length < 100) {
        return firstLine
      }
    }
    
    // Look for project or company mentions
    const projectMatch = text.match(/(?:project|proposal|solution)\s+(?:for\s+)?([A-Za-z0-9\s]+)(?:\s|\.)/i)
    if (projectMatch && projectMatch[1]) {
      return `Business Proposal for ${projectMatch[1].trim()}`
    }
    
    // Default title
    return `Business Proposal - ${new Date().toLocaleDateString()}`
  }
  
  private extractClientName(data: any): string {
    const text = data.businessProposal?.finalProposal || data.proposal || data.extractedRequirements || ''
    
    // Look for company/client name patterns
    const companyMatch = text.match(/(?:company|client|organization):\s*([A-Za-z0-9\s&.,]+)/i)
    if (companyMatch && companyMatch[1]) {
      return companyMatch[1].trim()
    }
    
    // Look for "for [Company Name]" patterns
    const forMatch = text.match(/\bfor\s+([A-Z][A-Za-z0-9\s&.,]{2,30})\b/)
    if (forMatch && forMatch[1]) {
      return forMatch[1].trim()
    }
    
    return 'Unnamed Client'
  }
  
  private extractProjectType(data: any): string {
    const text = (data.businessProposal?.finalProposal || data.proposal || '').toLowerCase()
    
    if (text.includes('software') || text.includes('development') || text.includes('application')) {
      return 'Software Development'
    }
    if (text.includes('marketing') || text.includes('advertising')) {
      return 'Marketing'
    }
    if (text.includes('consulting') || text.includes('advisory')) {
      return 'Consulting'
    }
    if (text.includes('design') || text.includes('ui/ux')) {
      return 'Design'
    }
    if (text.includes('construction') || text.includes('building')) {
      return 'Construction'
    }
    
    return 'General Business'
  }
  
  private detectSource(data: any): 'upload' | 'drive' | 'enhanced' {
    if (data.businessProposal?.metadata?.sourceFile?.driveId) {
      return 'drive'
    }
    if (data.projectContext || data.enhancedAnalysis) {
      return 'enhanced'
    }
    return 'upload'
  }
  
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length
  }
}

export const proposalStorage = new ProposalStorageService()

// Export a hook for React components
export function useProposalStorage() {
  return {
    storeProposal: proposalStorage.storeProposal.bind(proposalStorage),
    getAllProposals: proposalStorage.getAllProposals.bind(proposalStorage),
    getProposal: proposalStorage.getProposal.bind(proposalStorage),
    deleteProposal: proposalStorage.deleteProposal.bind(proposalStorage),
    updateProposal: proposalStorage.updateProposal.bind(proposalStorage),
    clearAll: proposalStorage.clearAll.bind(proposalStorage)
  }
}
