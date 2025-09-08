'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, FileText, Calendar, User, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { proposalStorage } from '@/lib/proposal-storage'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface User {
  id: string
  email: string
  name: string
  picture: string
}

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime: string
  modifiedTime: string
  webViewLink: string
  thumbnailLink?: string
}

interface AuthStatus {
  authenticated: boolean
  user: User | null
  hasGoogleDriveAccess: boolean
}

export default function GoogleDriveIntegration() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    authenticated: false,
    user: null,
    hasGoogleDriveAccess: false
  })
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [pdfFiles, setPdfFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Configure axios to include credentials
  axios.defaults.withCredentials = true

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/status`)
      setAuthStatus(response.data)
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/auth/google`)
      
      if (response.data.authUrl) {
        // Open Google OAuth in a popup
        const popup = window.open(
          response.data.authUrl,
          'google-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )

        // Listen for popup to close
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            // Recheck auth status after popup closes
            setTimeout(checkAuthStatus, 1000)
            setLoading(false)
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Error starting Google OAuth:', error)
      setLoading(false)
    }
  }

  const loadDriveFiles = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/drive/files`, {
        params: { search: searchTerm || undefined }
      })
      setDriveFiles(response.data.files || [])
    } catch (error) {
      console.error('Error loading Drive files:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPDFFiles = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/drive/pdfs`, {
        params: { search: searchTerm || undefined }
      })
      setPdfFiles(response.data.files || [])
    } catch (error) {
      console.error('Error loading PDF files:', error)
    } finally {
      setLoading(false)
    }
  }

  const processPDFFromDrive = async (fileId: string, fileName: string, enhanced: boolean = false) => {
    try {
      setProcessing(fileId)
      const endpoint = enhanced ? '/drive/process-pdf-enhanced' : '/drive/process-pdf'
      const response = await axios.post(`${API_BASE}${endpoint}`, {
        fileId
      })

      if (response.data.businessProposal) {
        // Store the proposal in the dashboard
        const storedProposal = proposalStorage.storeProposal(response.data)
        
        const message = enhanced 
          ? `Successfully processed ${fileName} with enhanced project analysis! Found ${response.data.projectContext?.totalDocuments || 0} related documents. Proposal saved to dashboard.` 
          : `Successfully processed ${fileName}! Proposal generated and saved to dashboard.`
        
        alert(message)
        console.log('Generated Proposal:', response.data.businessProposal)
        
        if (enhanced && response.data.projectContext) {
          console.log('Project Context:', response.data.projectContext)
        }
        
        // Ask user if they want to view in dashboard
        const viewInDashboard = confirm('Would you like to view the full proposal in the dashboard now?')
        if (viewInDashboard) {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      alert('Error processing PDF. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`)
      setAuthStatus({
        authenticated: false,
        user: null,
        hasGoogleDriveAccess: false
      })
      setDriveFiles([])
      setPdfFiles([])
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const formatFileSize = (bytes: string | undefined) => {
    if (!bytes) return 'Unknown size'
    const size = parseInt(bytes)
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (!authStatus.authenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Connect Google Drive</CardTitle>
          <CardDescription>
            Access your Google Drive to select RFP documents for processing
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {authStatus.user?.picture && (
                <img 
                  src={authStatus.user.picture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <CardTitle className="text-lg">{authStatus.user?.name}</CardTitle>
                <CardDescription>{authStatus.user?.email}</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Google Drive Files</CardTitle>
          <CardDescription>
            Browse your Google Drive files or search specifically for PDF documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <Button onClick={loadDriveFiles} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load Files'}
            </Button>
            <Button onClick={loadPDFFiles} disabled={loading} variant="outline">
              PDF Files Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      {(driveFiles.length > 0 || pdfFiles.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {pdfFiles.length > 0 ? 'PDF Files' : 'Drive Files'} 
              ({pdfFiles.length > 0 ? pdfFiles.length : driveFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(pdfFiles.length > 0 ? pdfFiles : driveFiles).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.modifiedTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {file.mimeType === 'application/pdf' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => processPDFFromDrive(file.id, file.name, false)}
                          disabled={processing === file.id}
                          variant="outline"
                        >
                          {processing === file.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Quick Process
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => processPDFFromDrive(file.id, file.name, true)}
                          disabled={processing === file.id}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {processing === file.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <FileText className="h-4 w-4 mr-2" />
                          )}
                          Enhanced Analysis
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.webViewLink, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Enhanced Project Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>1. <strong>Load Files:</strong> Click "Load Files" to browse all your Google Drive files</p>
          <p>2. <strong>PDF Files Only:</strong> Click "PDF Files Only" to filter just PDF documents</p>
          <p>3. <strong>Search:</strong> Enter search terms to find specific files</p>
          <p>4. <strong>Quick Process:</strong> Standard RFP processing for single document analysis</p>
          <p>5. <strong>Enhanced Analysis:</strong> 🚀 NEW! Analyzes ALL related project documents in your Drive</p>
          <p className="text-purple-700 font-medium">
            ✨ Enhanced Analysis finds related documents by project name and creates comprehensive proposals using ALL project context!
          </p>
          <p>6. <strong>View:</strong> Click "View" to open files in Google Drive</p>
        </CardContent>
      </Card>
    </div>
  )
}
