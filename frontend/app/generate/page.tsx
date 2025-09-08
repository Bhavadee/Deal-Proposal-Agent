"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, ArrowLeft, Zap, FileText, X, Upload } from "lucide-react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import EnhancedRFPUpload from "@/components/enhanced-rfp-upload"

export default function GeneratePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    businessIdea: "",
    industry: "",
    targetAudience: "",
    tone: "",
    length: "",
    includeFinancials: false,
    rfpFile: null as File | null,
    rfpContent: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessingRFP, setIsProcessingRFP] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const rfpTemplates = {
    "technology-services": {
      name: "Technology Services",
      description: "For IT consulting, software development, and tech implementation projects",
      sections: [
        "Executive Summary",
        "Technical Approach & Methodology",
        "Project Timeline & Milestones",
        "Team Qualifications & Experience",
        "Technology Stack & Tools",
        "Risk Management & Mitigation",
        "Pricing & Cost Breakdown",
        "Support & Maintenance",
      ],
      promptTemplate: `Create a comprehensive technology services RFP response that addresses:
- Technical requirements and proposed solutions
- Development methodology (Agile, Waterfall, etc.)
- Technology stack and architecture decisions
- Security and compliance considerations
- Testing and quality assurance processes
- Deployment and maintenance strategies`,
    },
    "consulting-services": {
      name: "Professional Consulting",
      description: "For management consulting, strategy, and advisory services",
      sections: [
        "Executive Summary",
        "Understanding of Client Needs",
        "Proposed Methodology & Approach",
        "Project Phases & Deliverables",
        "Team Expertise & Qualifications",
        "Case Studies & References",
        "Investment & ROI Analysis",
        "Next Steps & Timeline",
      ],
      promptTemplate: `Create a professional consulting RFP response that emphasizes:
- Deep understanding of client challenges
- Proven methodologies and frameworks
- Measurable outcomes and KPIs
- Change management strategies
- Knowledge transfer and capability building
- Long-term partnership approach`,
    },
    "marketing-advertising": {
      name: "Marketing & Advertising",
      description: "For creative campaigns, digital marketing, and brand strategy",
      sections: [
        "Campaign Overview",
        "Target Audience Analysis",
        "Creative Strategy & Concept",
        "Media Planning & Channel Strategy",
        "Campaign Timeline & Execution",
        "Team & Agency Credentials",
        "Budget Allocation & Pricing",
        "Success Metrics & Reporting",
      ],
      promptTemplate: `Create a marketing/advertising RFP response that showcases:
- Creative vision and brand understanding
- Multi-channel marketing strategies
- Data-driven targeting and personalization
- Campaign measurement and optimization
- Creative portfolio and case studies
- Media buying expertise and relationships`,
    },
    "construction-engineering": {
      name: "Construction & Engineering",
      description: "For construction projects, engineering services, and infrastructure",
      sections: [
        "Project Understanding",
        "Technical Approach & Design",
        "Construction Methodology",
        "Project Schedule & Milestones",
        "Team Qualifications & Certifications",
        "Safety & Compliance Measures",
        "Cost Estimate & Budget",
        "Quality Assurance & Control",
      ],
      promptTemplate: `Create a construction/engineering RFP response that demonstrates:
- Technical expertise and engineering capabilities
- Safety protocols and compliance standards
- Project management and scheduling
- Quality control and assurance processes
- Environmental considerations and sustainability
- Risk management and contingency planning`,
    },
    "healthcare-services": {
      name: "Healthcare Services",
      description: "For medical services, healthcare IT, and clinical solutions",
      sections: [
        "Clinical Overview",
        "Service Delivery Model",
        "Compliance & Regulatory Adherence",
        "Quality Measures & Outcomes",
        "Staff Qualifications & Credentials",
        "Technology & Infrastructure",
        "Pricing & Reimbursement",
        "Implementation & Training",
      ],
      promptTemplate: `Create a healthcare services RFP response that highlights:
- Clinical expertise and evidence-based practices
- HIPAA compliance and data security
- Quality metrics and patient outcomes
- Regulatory adherence and certifications
- Integration with existing healthcare systems
- Staff training and credentialing processes`,
    },
    "financial-services": {
      name: "Financial Services",
      description: "For banking, investment, insurance, and financial consulting",
      sections: [
        "Service Overview",
        "Regulatory Compliance Framework",
        "Risk Management Approach",
        "Technology & Security Infrastructure",
        "Team Expertise & Certifications",
        "Client Onboarding Process",
        "Fee Structure & Pricing",
        "Reporting & Analytics",
      ],
      promptTemplate: `Create a financial services RFP response that emphasizes:
- Regulatory compliance and risk management
- Fiduciary responsibility and ethics
- Technology security and data protection
- Investment philosophy and strategies
- Client service and relationship management
- Performance tracking and reporting capabilities`,
    },
  }

  const processRFPFile = async (file: File) => {
    setIsProcessingRFP(true)
    try {
      // Create FormData to send the PDF file to the backend
      const formData = new FormData()
      formData.append('rfp', file)

      // Send the PDF file to the backend
      const response = await fetch('http://localhost:4000/api/upload-rfp', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Use the extracted content from the backend response
      const rfpContent = result.extractedText || result.content || `
    REQUEST FOR PROPOSAL
    
    Project: ${file.name.replace(".pdf", "")}
    
    Uploaded file: ${file.name}
    File size: ${(file.size / 1024 / 1024).toFixed(2)} MB
    
    Please provide detailed information about your approach, timeline, and pricing.
    `

      setFormData((prev) => ({
        ...prev,
        rfpFile: file,
        rfpContent: rfpContent,
        businessIdea: `Responding to RFP: ${file.name}\n\nRFP Requirements:\n${rfpContent}\n\nOur Proposed Solution:\n`,
      }))
    } catch (error) {
      console.error("Error processing RFP:", error)
      alert(`Error processing RFP file: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      setIsProcessingRFP(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      processRFPFile(file)
    } else {
      alert("Please upload a PDF file.")
    }
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      processRFPFile(file)
    } else {
      alert("Please upload a PDF file.")
    }
  }

  const removeRFPFile = () => {
    setFormData((prev) => ({
      ...prev,
      rfpFile: null,
      rfpContent: "",
      businessIdea: "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.businessIdea.trim()) return

    setIsGenerating(true)

    try {
      const isRFPResponse = formData.rfpFile && formData.rfpContent

      const prompt = isRFPResponse
        ? `Create a professional business proposal in response to the following RFP (Request for Proposal):

RFP Content: ${formData.rfpContent}

Our Business Response: ${formData.businessIdea}
Industry: ${formData.industry || "Not specified"}
Target Audience: ${formData.targetAudience || "Not specified"}
Tone: ${formData.tone}
Length: ${formData.length}
Include Financial Estimates: ${formData.includeFinancials ? "Yes" : "No"}
${selectedTemplate ? `Template Type: ${rfpTemplates[selectedTemplate].name}` : ""}

${selectedTemplate ? rfpTemplates[selectedTemplate].promptTemplate : ""}

Please structure this as a professional RFP response with the following sections:
${
  selectedTemplate
    ? rfpTemplates[selectedTemplate].sections.map((section, index) => `${index + 1}. ${section}`).join("\n")
    : `1. Executive Summary
2. Understanding of Requirements
3. Proposed Solution
4. Implementation Timeline
5. Team & Qualifications
${formData.includeFinancials ? "6. Pricing & Financial Projections" : ""}
${formData.includeFinancials ? "7. Conclusion & Next Steps" : "6. Conclusion & Next Steps"}`
}

Make sure to directly address the RFP requirements and demonstrate how our solution meets their needs.`
        : `Create a professional business proposal based on the following details:

Business Idea: ${formData.businessIdea}
Industry: ${formData.industry || "Not specified"}
Target Audience: ${formData.targetAudience || "Not specified"}
Tone: ${formData.tone}
Length: ${formData.length}
Include Financial Estimates: ${formData.includeFinancials ? "Yes" : "No"}

Please structure the proposal with the following sections:
1. Executive Summary
2. Market Opportunity
3. Product/Service Description
4. Business Model
${formData.includeFinancials ? "5. Financial Projections" : ""}
${formData.includeFinancials ? "6. Conclusion" : "5. Conclusion"}

Make the tone ${formData.tone.toLowerCase()} and the length ${formData.length.toLowerCase()}.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
        system: isRFPResponse
          ? "You are a professional business consultant who creates compelling RFP responses. Format your response with clear headings and well-structured content that directly addresses the client's requirements."
          : "You are a professional business consultant who creates compelling, investor-ready business proposals. Format your response with clear headings and well-structured content.",
      })

      // Store the generated proposal in sessionStorage and navigate
      sessionStorage.setItem("generatedProposal", text)
      sessionStorage.setItem("proposalData", JSON.stringify(formData))
      router.push("/proposal")
    } catch (error) {
      console.error("Error generating proposal:", error)
      alert("Failed to generate proposal. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <Lightbulb className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">PitchPal</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Generate Your Business Proposal</h2>
            <p className="text-lg text-gray-600">Choose your preferred method for creating professional proposals</p>
          </div>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="enhanced">🚀 Enhanced RFP Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span>Business Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* RFP Upload Section */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Upload RFP Document (Optional)</Label>

                  {!formData.rfpFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragOver(true)
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleFileDrop}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">Drag and drop your RFP PDF here, or click to browse</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="rfp-upload"
                        disabled={isProcessingRFP}
                      />
                      <label
                        htmlFor="rfp-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        {isProcessingRFP ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose PDF File
                          </>
                        )}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Upload an RFP document to generate a targeted response proposal
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="text-sm font-medium text-emerald-800">{formData.rfpFile.name}</p>
                            <p className="text-xs text-emerald-600">RFP document uploaded successfully</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeRFPFile}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* RFP Template Selection */}
                  {formData.rfpFile && (
                    <div>
                      <Label className="text-base font-medium mb-3 block">Choose RFP Response Template</Label>
                      <Select onValueChange={(value) => setSelectedTemplate(value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select a template for your RFP response" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(rfpTemplates).map(([key, template]) => (
                            <SelectItem key={key} value={key}>
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs text-gray-500">{template.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedTemplate && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Template Sections:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            {rfpTemplates[selectedTemplate].sections.map((section, index) => (
                              <li key={index} className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                                {section}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="businessIdea" className="text-base font-medium">
                    {formData.rfpFile ? "Your Proposed Solution *" : "Describe Your Business Idea *"}
                  </Label>
                  <Textarea
                    id="businessIdea"
                    placeholder={
                      formData.rfpFile
                        ? "Describe how your solution addresses the RFP requirements, your unique approach, competitive advantages, and implementation strategy..."
                        : "Tell us about your business concept, what problem it solves, your unique value proposition, and any other relevant details..."
                    }
                    className="mt-2 min-h-[120px]"
                    value={formData.businessIdea}
                    onChange={(e) => setFormData((prev) => ({ ...prev, businessIdea: e.target.value }))}
                    required
                  />
                  {formData.rfpFile && (
                    <p className="text-xs text-gray-500 mt-1">
                      The AI will use both the RFP requirements and your solution description to create a targeted
                      proposal response.
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, industry: value }))}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      placeholder={
                        formData.rfpFile ? "RFP issuing organization" : "e.g., Small businesses, Millennials"
                      }
                      className="mt-2"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData((prev) => ({ ...prev, targetAudience: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-emerald-600" />
                  <span>{formData.rfpFile ? "RFP Response Options" : "Proposal Options"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Proposal Tone</Label>
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, tone: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Proposal Length</Label>
                  <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, length: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 pages)</SelectItem>
                      <SelectItem value="medium">Medium (3-4 pages)</SelectItem>
                      <SelectItem value="long">Long (5+ pages)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Switch
                    id="includeFinancials"
                    checked={formData.includeFinancials}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, includeFinancials: checked }))}
                  />
                  <Label htmlFor="includeFinancials" className="text-sm font-medium">
                    Include Financial Projections
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3"
                  disabled={isGenerating || !formData.businessIdea.trim() || !formData.tone || !formData.length}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {formData.rfpFile ? "Generating RFP Response..." : "Generating Proposal..."}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {formData.rfpFile ? "Generate RFP Response" : "Generate Proposal"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
          </TabsContent>

          <TabsContent value="enhanced">
            <EnhancedRFPUpload />
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
