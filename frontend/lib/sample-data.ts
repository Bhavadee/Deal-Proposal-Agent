// Demo script to populate the dashboard with sample proposals for testing
import { proposalStorage } from '../lib/proposal-storage'

export function createSampleProposals() {
  const sampleProposals = [
    {
      extractedRequirements: "The client requires a modern e-commerce platform with advanced features including product catalog, shopping cart, payment integration, user authentication, order management, and analytics dashboard.",
      businessProposal: {
        summary: "Comprehensive e-commerce solution for TechCorp",
        analysis: {
          complexity: "High",
          timeline: "6 months",
          riskLevel: "Medium",
          estimatedCost: "$150,000"
        },
        outline: `
1. Executive Summary
2. Project Understanding
3. Proposed Solution
4. Technology Stack
5. Implementation Timeline
6. Team Structure
7. Budget Breakdown
8. Risk Management
9. Success Metrics
        `,
        fullProposal: `
BUSINESS PROPOSAL: E-COMMERCE PLATFORM DEVELOPMENT

Executive Summary:
TechCorp Solutions requires a comprehensive e-commerce platform to expand their digital presence. Our proposed solution includes a modern, scalable platform built with cutting-edge technologies.

Project Understanding:
Based on the RFP requirements, we understand the need for:
- Product catalog management
- Secure payment processing
- User authentication and profiles
- Order management system
- Analytics and reporting
- Mobile-responsive design

Proposed Solution:
We propose developing a full-stack e-commerce platform using React.js for the frontend, Node.js for the backend, and PostgreSQL for data management.

Technology Stack:
- Frontend: React.js, Next.js, Tailwind CSS
- Backend: Node.js, Express.js, RESTful APIs
- Database: PostgreSQL
- Payment: Stripe integration
- Hosting: AWS cloud infrastructure

Implementation Timeline:
Phase 1: Discovery & Design (1 month)
Phase 2: Backend Development (2 months)
Phase 3: Frontend Development (2 months)
Phase 4: Integration & Testing (1 month)

Team Structure:
- Project Manager
- Senior Full-Stack Developer
- UI/UX Designer
- QA Engineer
- DevOps Engineer

Budget Breakdown:
Development: $120,000
Design: $20,000
Testing & QA: $10,000
Total: $150,000

Risk Management:
Technical risks will be mitigated through thorough planning and regular code reviews. Timeline risks will be managed through agile development practices.

Success Metrics:
- Platform performance benchmarks
- User satisfaction scores
- Conversion rate improvements
- System uptime targets
        `,
        review: "The proposal demonstrates strong technical understanding and provides comprehensive coverage of all requirements. The timeline is realistic and the team structure is appropriate for the project scope.",
        finalProposal: `
BUSINESS PROPOSAL
E-COMMERCE PLATFORM DEVELOPMENT FOR TECHCORP SOLUTIONS

===================================================

EXECUTIVE SUMMARY

TechCorp Solutions seeks to establish a robust digital commerce presence through a comprehensive e-commerce platform. Our proposal outlines a complete solution that addresses all specified requirements while ensuring scalability, security, and exceptional user experience.

PROJECT UNDERSTANDING

Based on your RFP, we understand TechCorp's need for:
• Modern product catalog with advanced search and filtering
• Secure, multi-gateway payment processing
• Comprehensive user authentication and profile management
• Efficient order management and fulfillment system
• Real-time analytics and business intelligence dashboard
• Mobile-first responsive design
• SEO optimization for improved visibility

PROPOSED SOLUTION

We propose a cutting-edge e-commerce platform built on modern web technologies:

FRONTEND ARCHITECTURE:
- React.js with Next.js for optimal performance and SEO
- Tailwind CSS for responsive, modern UI design
- Progressive Web App (PWA) capabilities
- Advanced state management with Redux

BACKEND INFRASTRUCTURE:
- Node.js with Express.js for scalable API development
- Microservices architecture for modular functionality
- RESTful API design with GraphQL optimization
- Redis for caching and session management

DATABASE & STORAGE:
- PostgreSQL for transactional data integrity
- AWS S3 for media and asset storage
- Elasticsearch for advanced product search

INTEGRATION CAPABILITIES:
- Stripe and PayPal payment processing
- Inventory management system integration
- Email marketing platform connectivity
- Social media and analytics tools integration

IMPLEMENTATION TIMELINE

PHASE 1: DISCOVERY & PLANNING (Month 1)
- Stakeholder interviews and requirement refinement
- Technical architecture design
- UI/UX mockups and prototypes
- Development environment setup

PHASE 2: BACKEND DEVELOPMENT (Months 2-3)
- Database schema implementation
- API development and testing
- Payment gateway integration
- Security framework establishment

PHASE 3: FRONTEND DEVELOPMENT (Months 4-5)
- Component library development
- User interface implementation
- Mobile optimization
- Performance optimization

PHASE 4: INTEGRATION & TESTING (Month 6)
- System integration testing
- User acceptance testing
- Performance and load testing
- Production deployment and go-live

TEAM COMPOSITION

PROJECT LEADERSHIP:
- Senior Project Manager with e-commerce expertise
- Technical Lead with 8+ years full-stack experience

DEVELOPMENT TEAM:
- 2 Senior Full-Stack Developers
- 1 Frontend Specialist (React/Next.js)
- 1 Backend Specialist (Node.js/PostgreSQL)
- 1 UI/UX Designer
- 1 QA Engineer
- 1 DevOps Engineer

INVESTMENT BREAKDOWN

DEVELOPMENT COSTS:
- Backend Development: $60,000
- Frontend Development: $50,000
- Integration & APIs: $20,000
- UI/UX Design: $15,000
- Quality Assurance: $10,000
- DevOps & Deployment: $8,000
- Project Management: $12,000

TOTAL INVESTMENT: $175,000

RISK MITIGATION

TECHNICAL RISKS:
- Comprehensive code reviews and testing protocols
- Continuous integration/deployment pipelines
- Regular security audits and penetration testing

TIMELINE RISKS:
- Agile development with 2-week sprints
- Regular stakeholder communication and feedback loops
- Buffer time allocated for unforeseen challenges

QUALITY ASSURANCE:
- Automated testing at all levels
- User acceptance testing with real customers
- Performance monitoring and optimization

SUCCESS METRICS

PERFORMANCE INDICATORS:
- Page load times under 2 seconds
- 99.9% system uptime
- Mobile performance score above 90

BUSINESS METRICS:
- 25% improvement in conversion rates
- 40% increase in mobile traffic engagement
- 30% reduction in cart abandonment

USER EXPERIENCE:
- User satisfaction score above 4.5/5
- Customer support ticket reduction by 20%
- Return customer rate improvement of 35%

ONGOING SUPPORT

POST-LAUNCH SERVICES:
- 3 months complimentary technical support
- 24/7 monitoring and maintenance
- Regular security updates and patches
- Performance optimization reviews

CONCLUSION

Our comprehensive e-commerce solution for TechCorp combines technical excellence with business acumen. We're committed to delivering a platform that not only meets your current requirements but positions you for future growth and success in the digital marketplace.

We look forward to partnering with TechCorp Solutions in this exciting venture.

---
Proposal prepared by: AI Business Solutions
Date: ${new Date().toLocaleDateString()}
Proposal ID: TECH-ECOM-2024-001
        `,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingSteps: ['analyze', 'outline', 'generate', 'review', 'finalize'],
          proposalLength: 4850,
          estimatedReadingTime: '15 minutes',
          wordCount: 850,
          sourceFile: {
            name: 'TechCorp_RFP_Ecommerce.pdf',
            size: '2.4 MB'
          }
        }
      },
      processingInfo: {
        extractedRequirementsWordCount: 35,
        analysisCompleted: true,
        outlineGenerated: true,
        proposalGenerated: true,
        reviewCompleted: true,
        finalized: true
      }
    },
    {
      extractedRequirements: "Development of a mobile application for healthcare providers to manage patient records, appointments, and telemedicine consultations with HIPAA compliance.",
      businessProposal: {
        summary: "HIPAA-compliant healthcare mobile application",
        analysis: {
          complexity: "Very High",
          timeline: "8 months",
          riskLevel: "High",
          estimatedCost: "$280,000"
        },
        outline: `
1. Executive Summary
2. Healthcare Requirements Analysis
3. HIPAA Compliance Framework
4. Mobile App Architecture
5. Security Implementation
6. Development Timeline
7. Testing & Certification
8. Deployment & Support
        `,
        fullProposal: "Healthcare Mobile Application Development Proposal...",
        review: "Comprehensive proposal addressing all healthcare-specific requirements and compliance needs.",
        finalProposal: `
BUSINESS PROPOSAL
HEALTHCARE MOBILE APPLICATION DEVELOPMENT

===================================================

EXECUTIVE SUMMARY

HealthTech Innovations requires a comprehensive mobile application to revolutionize patient care delivery through digital health management. Our proposal presents a HIPAA-compliant solution that enables healthcare providers to efficiently manage patient records, streamline appointment scheduling, and deliver secure telemedicine services.

PROJECT SCOPE & REQUIREMENTS

CORE FUNCTIONALITY:
• Electronic Health Records (EHR) management
• Appointment scheduling and calendar integration
• Telemedicine video consultation platform
• Secure patient communication portal
• Prescription management system
• Clinical decision support tools
• Insurance verification and billing integration

COMPLIANCE REQUIREMENTS:
• Full HIPAA compliance implementation
• SOC 2 Type II certification readiness
• FDA medical device software considerations
• State-specific healthcare regulations

PROPOSED SOLUTION

MOBILE ARCHITECTURE:
- Native iOS and Android applications
- Cross-platform framework using React Native
- Offline-first data synchronization
- Biometric authentication integration

BACKEND INFRASTRUCTURE:
- HIPAA-compliant cloud hosting (AWS HIPAA eligible)
- End-to-end encryption for all data transmission
- Audit logging and compliance monitoring
- Disaster recovery and data backup systems

SECURITY FRAMEWORK:
- Multi-factor authentication
- Role-based access control
- Data encryption at rest and in transit
- Regular security assessments and penetration testing

IMPLEMENTATION TIMELINE: 8 MONTHS

PHASE 1: COMPLIANCE & PLANNING (Months 1-2)
- HIPAA compliance framework setup
- Security architecture design
- Regulatory consultation and approval
- User experience design and prototyping

PHASE 2: CORE DEVELOPMENT (Months 3-5)
- Backend API development with security focus
- Mobile app development for iOS and Android
- EHR integration and data migration tools
- Telemedicine platform implementation

PHASE 3: TESTING & CERTIFICATION (Months 6-7)
- HIPAA compliance testing and audit
- Clinical workflow validation
- User acceptance testing with healthcare providers
- Performance and security testing

PHASE 4: DEPLOYMENT & GO-LIVE (Month 8)
- Production environment setup
- Staff training and onboarding
- Phased rollout to healthcare facilities
- Post-launch support and monitoring

TEAM EXPERTISE

LEADERSHIP:
- Healthcare IT Project Manager (10+ years)
- Senior Solutions Architect (Healthcare domain)
- HIPAA Compliance Officer
- Clinical Consultant (MD)

DEVELOPMENT TEAM:
- 3 Senior Mobile Developers (iOS/Android)
- 2 Backend Developers (Healthcare APIs)
- 1 Frontend Developer (Web portal)
- 2 Security Engineers
- 1 QA Engineer (Healthcare testing)
- 1 DevOps Engineer (HIPAA cloud)

INVESTMENT STRUCTURE

DEVELOPMENT INVESTMENT:
- Mobile App Development: $120,000
- Backend Development: $80,000
- Security Implementation: $40,000
- HIPAA Compliance Setup: $25,000
- Testing & Quality Assurance: $30,000
- Regulatory Consultation: $15,000
- Project Management: $20,000
- Training & Documentation: $12,000

TOTAL INVESTMENT: $342,000

RISK MANAGEMENT

REGULATORY COMPLIANCE:
- Continuous compliance monitoring
- Regular legal and regulatory reviews
- Third-party security audits
- Breach notification protocols

TECHNICAL RISKS:
- Comprehensive testing protocols
- Redundant security measures
- Data backup and recovery procedures
- 24/7 system monitoring

CLINICAL WORKFLOW:
- Extensive healthcare provider consultation
- Pilot testing with select practices
- Iterative feedback and improvement cycles
- Clinical workflow optimization

SUCCESS METRICS

OPERATIONAL EFFICIENCY:
- 40% reduction in administrative tasks
- 60% improvement in appointment scheduling efficiency
- 50% decrease in patient wait times

CLINICAL OUTCOMES:
- 99.9% system uptime for critical operations
- Sub-second response times for patient data access
- 25% improvement in patient satisfaction scores

COMPLIANCE METRICS:
- Zero compliance violations
- 100% audit trail accuracy
- Complete data encryption coverage

ONGOING SUPPORT & MAINTENANCE

POST-LAUNCH SERVICES:
- 6 months comprehensive technical support
- 24/7 emergency response for critical issues
- Monthly compliance monitoring reports
- Quarterly security assessments
- Annual HIPAA compliance audits

FUTURE ENHANCEMENTS:
- AI-powered clinical decision support
- Integration with wearable health devices
- Advanced analytics and reporting
- Expansion to specialty care modules

CONCLUSION

Our healthcare mobile application solution combines deep healthcare domain expertise with cutting-edge technology to deliver a platform that enhances patient care while ensuring complete regulatory compliance. We're committed to supporting HealthTech Innovations in transforming healthcare delivery through secure, efficient digital solutions.

---
Proposal prepared by: AI Healthcare Solutions
Date: ${new Date().toLocaleDateString()}
Proposal ID: HEALTH-MOBILE-2024-002
        `,
        metadata: {
          generatedAt: new Date().toISOString(),
          processingSteps: ['analyze', 'outline', 'generate', 'review', 'finalize'],
          proposalLength: 5200,
          estimatedReadingTime: '18 minutes',
          wordCount: 920,
          sourceFile: {
            name: 'HealthTech_Mobile_RFP.pdf',
            size: '1.8 MB'
          }
        }
      },
      processingInfo: {
        extractedRequirementsWordCount: 28,
        analysisCompleted: true,
        outlineGenerated: true,
        proposalGenerated: true,
        reviewCompleted: true,
        finalized: true
      }
    }
  ]

  // Store each sample proposal
  sampleProposals.forEach(proposal => {
    proposalStorage.storeProposal(proposal)
  })

  console.log('Sample proposals created successfully!')
  return sampleProposals.length
}
