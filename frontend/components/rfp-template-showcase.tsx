import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Code, Briefcase, Megaphone, Building, Heart, DollarSign } from "lucide-react"

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
    features: ["Technical Architecture", "Development Methodology", "Security & Compliance", "Testing & QA"],
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "consulting-services",
    name: "Professional Consulting",
    description: "Ideal for management consulting, strategy, and advisory services",
    features: ["Methodology & Approach", "Case Studies", "ROI Analysis", "Change Management"],
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "marketing-advertising",
    name: "Marketing & Advertising",
    description: "Designed for creative campaigns, digital marketing, and brand strategy",
    features: ["Creative Strategy", "Media Planning", "Target Audience", "Success Metrics"],
    color: "bg-pink-100 text-pink-800",
  },
  {
    id: "construction-engineering",
    name: "Construction & Engineering",
    description: "Built for construction projects, engineering services, and infrastructure",
    features: ["Technical Design", "Safety Protocols", "Project Schedule", "Quality Control"],
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "healthcare-services",
    name: "Healthcare Services",
    description: "Tailored for medical services, healthcare IT, and clinical solutions",
    features: ["Clinical Expertise", "HIPAA Compliance", "Quality Outcomes", "Staff Credentials"],
    color: "bg-green-100 text-green-800",
  },
  {
    id: "financial-services",
    name: "Financial Services",
    description: "Crafted for banking, investment, insurance, and financial consulting",
    features: ["Regulatory Compliance", "Risk Management", "Security Infrastructure", "Performance Tracking"],
    color: "bg-indigo-100 text-indigo-800",
  },
]

export default function RFPTemplateShowcase() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Industry-Specific RFP Templates</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from professionally crafted templates designed for your industry's specific RFP requirements and best
            practices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {templates.map((template) => {
            const IconComponent = templateIcons[template.id]
            return (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${template.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Ready to create your professional RFP response?</p>
          <a
            href="/generate"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FileText className="mr-2 h-4 w-4" />
            Start with Templates
          </a>
        </div>
      </div>
    </section>
  )
}
