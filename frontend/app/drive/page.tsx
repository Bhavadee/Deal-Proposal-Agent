import GoogleDriveIntegration from "@/components/google-drive-integration"

export default function DrivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Google Drive Integration
            </h1>
            <p className="text-lg text-gray-600">
              Connect to your Google Drive to access and process RFP documents directly
            </p>
          </div>
          
          <GoogleDriveIntegration />
        </div>
      </div>
    </div>
  )
}
