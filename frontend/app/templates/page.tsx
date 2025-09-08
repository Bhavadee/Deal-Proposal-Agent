import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Lightbulb,
  ArrowLeft,
  FileText,
  Code,
  Briefcase,
  Megaphone,
  Building,
  Heart,
  DollarSign,
  CheckCircle,
} from "lucide-react"

const templateIcons = {
  "technology-services": Code,
  "consulting-services": Briefcase,
  "marketing-advertising": Megaphone,
  "construction-engineering": Building,
  "healthcare-services": Heart,
  "financial-services": DollarSign,
}

const templates = [
  {
    id: "technology-services",
    name: "Technology Services",
    description: "Perfect for IT consulting, software development, and tech implementation projects",
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
    features: ["Agile/Waterfall Methodology", "Security & Compliance", "Testing & QA", "DevOps Integration"],
    color: "bg-blue-100 text-blue-800",
    borderColor: "border-blue-200",
  },
  {
    id: "consulting-services",
    name: "Professional Consulting",
    description: "Ideal for management consulting, strategy, and advisory services",
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
    features: ["Proven Methodologies", "Change Management", "ROI Analysis", "Knowledge Transfer"],
    color: "bg-purple-100 text-purple-800",
    borderColor: "border-purple-200",
  },
  {
    id: "marketing-advertising",
    name: "Marketing & Advertising",
    description: "Designed for creative campaigns, digital marketing, and brand strategy",
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
    features: ["Multi-Channel Strategy", "Creative Portfolio", "Data-Driven Targeting", "Performance Analytics"],
    color: "bg-pink-100 text-pink-800",
    borderColor: "border-pink-200",
  },
  {
    id: "construction-engineering",
    name: "Construction & Engineering",
    description: "Built for construction projects, engineering services, and infrastructure",
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
    features: ["Safety Protocols", "Quality Control", "Environmental Compliance", "Project Management"],
    color: "bg-orange-100 text-orange-800",
    borderColor: "border-orange-200",
  },
  {
    id: "healthcare-services",
    name: "Healthcare Services",
    description: "Tailored for medical services, healthcare IT, and clinical solutions",
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
    features: ["HIPAA Compliance", "Clinical Excellence", "Quality Outcomes", "Staff Credentialing"],
    color: "bg-green-100 text-green-800",
    borderColor: "border-green-200",
  },
  {
    id: "financial-services",
    name: "Financial Services",
    description: "Crafted for banking, investment, insurance, and financial consulting",
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
    features: ["Regulatory Compliance", "Risk Management", "Fiduciary Standards", "Security Infrastructure"],
    color: "bg-indigo-100 text-indigo-800",
    borderColor: "border-indigo-200",
  },
]

export default function TemplatesPage() {
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
          <Link href="/generate">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <FileText className="mr-2 h-4 w-4" />
              Start Generating
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">RFP Response Templates</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from professionally crafted templates designed for your industry's specific RFP requirements. Each
              template includes industry best practices and structured sections to help you create winning proposals.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {templates.map((template) => {
              const IconComponent = templateIcons[template.id]
              return (
                <Card
                  key={template.id}
                  className={`hover:shadow-lg transition-shadow border-2 ${template.borderColor}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 rounded-lg ${template.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{template.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Key Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Template Sections */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Template Sections:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {template.sections.map((section, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                            {section}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link href="/generate" className="block">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Use This Template</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Create Your RFP Response?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Upload your RFP document, choose a template, and let our AI create a professional, industry-specific
              response that addresses all requirements.
            </p>
            <Link href="/generate">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4">
                <FileText className="mr-2 h-5 w-5" />
                Start with Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
