import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Lightbulb, FileText, Download, Zap } from "lucide-react"
import RFPTemplateShowcase from "@/components/rfp-template-showcase"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">PitchPal</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">
              How it Works
            </Link>
            <Link href="/templates" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Templates
            </Link>
            <Link href="/drive" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Google Drive
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Dashboard
            </Link>
            <Link href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Ideas into <span className="text-indigo-600">Investor-Ready</span> Proposals with AI
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your business concepts into professional, compelling proposals in minutes. Upload RFP documents
            for targeted responses, or create original business proposals. Our AI understands your vision and crafts
            persuasive documents that get results.
          </p>
          <Link href="/generate">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg">
              <Zap className="mr-2 h-5 w-5" />
              Start Generating
            </Button>
          </Link>
        </div>

        {/* Demo Preview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-600">Business Proposal Generator</span>
              </div>
            </div>
            <div className="p-8">
              <img
                src="/placeholder-m2isf.png"
                alt="Generated business proposal preview"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How PitchPal Works</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your business idea into a professional proposal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">1. Share Your Idea</h4>
              <p className="text-gray-600">
                Describe your business concept or upload an RFP document. Include your target market, product details,
                and vision for targeted responses.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">2. AI Generates</h4>
              <p className="text-gray-600">
                Our advanced AI analyzes your input and RFP requirements to create comprehensive, professional proposals
                tailored to your specific needs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">3. Download & Present</h4>
              <p className="text-gray-600">
                Get your polished proposal or RFP response as a PDF, ready to share with investors, clients, partners,
                or stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RFP Templates Showcase */}
      <RFPTemplateShowcase />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Lightbulb className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold">PitchPal</span>
            </div>
            <div className="flex space-x-8 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 PitchPal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
