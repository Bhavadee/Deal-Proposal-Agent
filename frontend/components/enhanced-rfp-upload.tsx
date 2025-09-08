'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, FileText, AlertCircle, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { proposalStorage } from '@/lib/proposal-storage'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface AuthStatus {
  authenticated: boolean
  user: any
  hasGoogleDriveAccess: boolean
}

export default function EnhancedRFPUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    user: null,
    hasGoogleDriveAccess: false
  })
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  // Configure axios to include credentials
  axios.defaults.withCredentials = true

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/status`)
      setAuthStatus(response.data)
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setResult(null)
    } else {
      alert('Please select a PDF file')
    }
  }

  const uploadAndProcess = async (enhanced: boolean = false) => {
    if (!file) return

    try {
      setProcessing(true)
      const formData = new FormData()
      formData.append('rfp', file)

      const endpoint = enhanced 
        ? (authStatus.authenticated ? '/upload-rfp-enhanced' : '/upload-rfp')
        : '/upload-rfp'
      
      if (enhanced && !authStatus.authenticated) {
        alert('Enhanced analysis requires Google Drive authentication. Using standard processing instead.')
      }

      const response = await axios.post(`${API_BASE}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setResult(response.data)
      
      // Store the proposal in the dashboard
      const storedProposal = proposalStorage.storeProposal(response.data)
      
      if (enhanced && response.data.projectContext) {
        alert(`Enhanced analysis completed! Found ${response.data.projectContext.totalDocuments} related documents. Proposal saved to dashboard.`)
      } else {
        alert('RFP processed successfully! Proposal saved to dashboard.')
      }

    } catch (error: any) {
      console.error('Error processing RFP:', error)
      const errorMessage = error.response?.data?.error || 'Error processing RFP'
      alert(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  return (
    <div className="w-full space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload RFP Document</CardTitle>
          <CardDescription>
            Upload your RFP PDF for AI-powered proposal generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="rfp-upload"
            />
            <label htmlFor="rfp-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700">
                {file ? file.name : 'Select RFP PDF File'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Click to browse or drag and drop your PDF file
              </p>
            </label>
          </div>

          {file && (
            <div className="flex space-x-4">
              <Button
                onClick={() => uploadAndProcess(false)}
                disabled={processing}
                variant="outline"
                className="flex-1"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Quick Process
              </Button>
              
              <Button
                onClick={() => uploadAndProcess(true)}
                disabled={processing}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Enhanced Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Enhanced Analysis Status</span>
            {authStatus.authenticated ? (
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            ) : (
              <Badge variant="outline">Not Connected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {authStatus.authenticated ? (
            <div className="flex items-center space-x-2 text-green-600">
              <FileText className="h-5 w-5" />
              <span>Google Drive connected - Enhanced analysis available</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span>Connect Google Drive for enhanced project analysis</span>
              </div>
              <p className="text-sm text-gray-600">
                Enhanced analysis searches your Drive for related project documents and creates comprehensive proposals
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Features */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Process</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Single document analysis</li>
                <li>• Fast processing</li>
                <li>• Standard proposal generation</li>
                <li>• No authentication required</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-purple-50">
              <h3 className="font-semibold text-purple-900 mb-2">Enhanced Analysis 🚀</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Multi-document project analysis</li>
                <li>• Searches related project files</li>
                <li>• Comprehensive context understanding</li>
                <li>• Requires Google Drive connection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {result.processingInfo?.extractedRequirementsWordCount || 0}
                </p>
                <p className="text-sm text-gray-600">Words Extracted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {result.businessProposal?.metadata?.proposalLength || 0}
                </p>
                <p className="text-sm text-gray-600">Characters Generated</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {result.projectContext?.totalDocuments || 0}
                </p>
                <p className="text-sm text-gray-600">Related Documents</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {result.businessProposal?.metadata?.estimatedReadingTime || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">Reading Time</p>
              </div>
            </div>

            {result.projectContext && (
              <div>
                <h4 className="font-semibold mb-2">Project Context:</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  <strong>Project:</strong> {result.projectContext.projectName}<br />
                  <strong>Documents Analyzed:</strong> {result.projectContext.totalDocuments}<br />
                  <strong>Summary:</strong> {result.projectContext.projectSummary?.substring(0, 200)}...
                </p>
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Final Proposal Preview:</h4>
              <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {result.businessProposal?.finalProposal?.substring(0, 1000)}...
                </pre>
              </div>
            </div>
            
            <div className="flex gap-4 pt-4 border-t">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Full Proposal in Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const content = result.businessProposal?.finalProposal || ''
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'business_proposal.txt'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
