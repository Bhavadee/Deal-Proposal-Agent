'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Calendar, 
  Clock,
  Building,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Globe,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  BarChart3,
  Shield,
  Settings
} from 'lucide-react'
import axios from 'axios'
import { createSampleProposals } from '@/lib/sample-data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface ProposalMetadata {
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

interface ProposalData {
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
    metadata: ProposalMetadata
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

const ProposalDashboard = () => {
  const [proposals, setProposals] = useState<ProposalData[]>([])
  const [selectedProposal, setSelectedProposal] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Configure axios
  axios.defaults.withCredentials = true

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real implementation, you'd have an endpoint to fetch all proposals
      // For now, we'll check if there are any stored in sessionStorage or localStorage
      const storedProposals = localStorage.getItem('generatedProposals')
      if (storedProposals) {
        const parsedProposals = JSON.parse(storedProposals)
        setProposals(parsedProposals)
        if (parsedProposals.length > 0) {
          setSelectedProposal(parsedProposals[0])
        }
      }
    } catch (error) {
      console.error('Error loading proposals:', error)
      setError('Failed to load proposals')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'draft': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'sent': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'drive': return <Globe className="w-4 h-4" />
      case 'enhanced': return <TrendingUp className="w-4 h-4" />
      case 'upload': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'drive': return 'Google Drive'
      case 'enhanced': return 'Enhanced Analysis'
      case 'upload': return 'Direct Upload'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportProposal = (proposal: ProposalData, format: 'pdf' | 'docx' | 'txt' = 'txt') => {
    const content = proposal.businessProposal.finalProposal
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${proposal.title.replace(/\s+/g, '_')}_proposal.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareProposal = async (proposal: ProposalData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: proposal.title,
          text: `Business Proposal: ${proposal.title}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const renderProposalContent = (proposal: ProposalData) => {
    if (!proposal) return null

    const sections = [
      { 
        title: 'Executive Summary', 
        content: proposal.businessProposal.summary || 'Not available',
        icon: <Briefcase className="w-5 h-5" />
      },
      { 
        title: 'Requirements Analysis', 
        content: proposal.extractedRequirements,
        icon: <Target className="w-5 h-5" />
      },
      { 
        title: 'Project Analysis', 
        content: typeof proposal.businessProposal.analysis === 'string' 
          ? proposal.businessProposal.analysis 
          : JSON.stringify(proposal.businessProposal.analysis, null, 2),
        icon: <BarChart3 className="w-5 h-5" />
      },
      { 
        title: 'Proposal Outline', 
        content: proposal.businessProposal.outline,
        icon: <Settings className="w-5 h-5" />
      },
      { 
        title: 'Full Proposal', 
        content: proposal.businessProposal.fullProposal,
        icon: <FileText className="w-5 h-5" />
      },
      { 
        title: 'Quality Review', 
        content: proposal.businessProposal.review,
        icon: <Shield className="w-5 h-5" />
      },
      { 
        title: 'Final Business Proposal', 
        content: proposal.businessProposal.finalProposal,
        icon: <Award className="w-5 h-5" />
      }
    ]

    return (
      <Tabs defaultValue="final" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="final">Final</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="outline">Outline</TabsTrigger>
          <TabsTrigger value="full">Full Text</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="final" className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Final Business Proposal
              </CardTitle>
              <CardDescription className="text-blue-100">
                Complete, polished proposal ready for client presentation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {proposal.businessProposal.finalProposal}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {proposal.businessProposal.summary || 'Summary not available'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Project Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-mono text-sm">
                {typeof proposal.businessProposal.analysis === 'string' 
                  ? proposal.businessProposal.analysis 
                  : JSON.stringify(proposal.businessProposal.analysis, null, 2)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outline" className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Proposal Outline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {proposal.businessProposal.outline}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="full" className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Full Proposal Draft
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {proposal.businessProposal.fullProposal}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Quality Review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {proposal.businessProposal.review}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Extracted Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {proposal.extractedRequirements}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Proposal Dashboard</h1>
          <p className="text-gray-600">Manage and view all your AI-generated business proposals</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {proposals.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600 mb-6">
                Generate your first business proposal by uploading an RFP document or connecting to Google Drive.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <a href="/generate">Generate Proposal</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/drive">Connect Google Drive</a>
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    createSampleProposals()
                    loadProposals()
                  }}
                >
                  Create Sample Data
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Proposal List Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Proposals ({proposals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    {proposals.map((proposal, index) => (
                      <div
                        key={proposal.id || index}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedProposal?.id === proposal.id || (selectedProposal === proposal) 
                            ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                            : ''
                        }`}
                        onClick={() => setSelectedProposal(proposal)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                            {proposal.title || `Proposal ${index + 1}`}
                          </h3>
                          {getSourceIcon(proposal.source)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {getSourceLabel(proposal.source)}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getStatusColor(proposal.status || 'completed')}`}>
                            {proposal.status || 'completed'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(proposal.createdAt || proposal.businessProposal?.metadata?.generatedAt || new Date().toISOString()).split(',')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Proposal View */}
            <div className="lg:col-span-3">
              {selectedProposal && (
                <div className="space-y-6">
                  {/* Proposal Header */}
                  <Card className="shadow-lg border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {selectedProposal.title || 'Business Proposal'}
                          </h1>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {getSourceLabel(selectedProposal.source)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(selectedProposal.createdAt || selectedProposal.businessProposal?.metadata?.generatedAt || new Date().toISOString())}
                            </span>
                            {selectedProposal.businessProposal?.metadata?.estimatedReadingTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {selectedProposal.businessProposal.metadata.estimatedReadingTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => exportProposal(selectedProposal)}>
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => shareProposal(selectedProposal)}>
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <Badge className={getStatusColor(selectedProposal.status || 'completed')}>
                              {selectedProposal.status || 'completed'}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-blue-700 mt-2">
                            {selectedProposal.businessProposal?.metadata?.wordCount || 'N/A'}
                          </p>
                          <p className="text-sm text-blue-600">Words</p>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-green-700 mt-2">
                            {selectedProposal.processingInfo?.finalized ? '100%' : '90%'}
                          </p>
                          <p className="text-sm text-green-600">Complete</p>
                        </div>

                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold text-purple-700 mt-2">
                            {selectedProposal.businessProposal?.metadata?.processingSteps?.length || 5}
                          </p>
                          <p className="text-sm text-purple-600">AI Steps</p>
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between">
                            <Clock className="w-8 h-8 text-orange-600" />
                          </div>
                          <p className="text-2xl font-bold text-orange-700 mt-2">
                            {selectedProposal.businessProposal?.metadata?.estimatedReadingTime || 'N/A'}
                          </p>
                          <p className="text-sm text-orange-600">Read Time</p>
                        </div>
                      </div>

                      {/* Processing Steps */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Processing Pipeline</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {(selectedProposal.businessProposal?.metadata?.processingSteps || ['analyze', 'outline', 'generate', 'review', 'finalize']).map((step, index) => (
                            <div key={index} className="flex items-center">
                              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                {step}
                              </div>
                              {index < (selectedProposal.businessProposal?.metadata?.processingSteps?.length || 5) - 1 && (
                                <div className="w-4 h-0.5 bg-green-300 mx-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Proposal Content */}
                  {renderProposalContent(selectedProposal)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProposalDashboard
