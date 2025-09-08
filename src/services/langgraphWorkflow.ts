import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';

// Define the state using Annotation
const ProposalState = Annotation.Root({
  requirements: Annotation<string>,
  analysis: Annotation<any>,
  outline: Annotation<string>,
  fullProposal: Annotation<string>,
  review: Annotation<string>,
  finalProposal: Annotation<string>,
});

type ProposalStateType = typeof ProposalState.State;

export class ProposalWorkflow {
  private model: ChatOpenAI;
  private workflow: any;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.setupWorkflow();
  }

  private setupWorkflow() {
    // Define workflow nodes
    const analyzeRequirements = async (state: ProposalStateType) => {
      console.log('\n📊 STEP 1: ANALYZING REQUIREMENTS...');
      console.log('📊 Processing requirements:', state.requirements.substring(0, 200) + '...');
      
      const analysisPrompt = `As an expert business analyst, analyze the following RFP requirements and extract comprehensive information:
      
      RFP REQUIREMENTS:
      ${state.requirements}
      
      Provide a detailed analysis in JSON format with the following structure:
      {
        "project_overview": "Brief summary of the project",
        "key_objectives": ["objective1", "objective2", "objective3"],
        "technical_requirements": ["req1", "req2", "req3"],
        "deliverables": ["deliverable1", "deliverable2"],
        "timeline_indicators": "estimated project duration",
        "budget_indicators": "budget range or indicators",
        "complexity_level": "low/medium/high",
        "industry_sector": "relevant industry",
        "stakeholders": ["stakeholder1", "stakeholder2"],
        "success_criteria": ["criteria1", "criteria2"],
        "risks_identified": ["risk1", "risk2"],
        "compliance_requirements": ["requirement1", "requirement2"]
      }`;

      const messages = [
        new SystemMessage("You are an expert business analyst specializing in RFP analysis. Extract comprehensive information and return valid JSON only."),
        new HumanMessage(analysisPrompt)
      ];

      const response = await this.model.invoke(messages);
      const parser = new StringOutputParser();
      const analysisText = await parser.invoke(response);

      try {
        const analysis = JSON.parse(analysisText);
        console.log('📊 ✅ Requirements analysis completed successfully');
        console.log('📊 Analysis keys:', Object.keys(analysis).join(', '));
        return { ...state, analysis };
      } catch (error) {
        // Fallback with structured analysis
        console.warn('📊 ⚠️ JSON parsing failed, creating structured fallback analysis');
        const fallbackAnalysis = {
          project_overview: "Complex project requiring detailed analysis",
          key_objectives: ["Meet RFP requirements", "Deliver quality solution", "Ensure client satisfaction"],
          technical_requirements: ["Technical solution", "Implementation", "Testing"],
          deliverables: ["Final product", "Documentation", "Support"],
          timeline_indicators: "To be determined based on scope",
          budget_indicators: "Competitive pricing",
          complexity_level: "medium",
          industry_sector: "general",
          stakeholders: ["Client", "End users", "Technical team"],
          success_criteria: ["On-time delivery", "Quality standards", "Client approval"],
          risks_identified: ["Technical challenges", "Timeline constraints"],
          compliance_requirements: ["Industry standards", "Best practices"],
          raw_analysis: analysisText
        };
        console.log('📊 ✅ Fallback analysis created');
        return { ...state, analysis: fallbackAnalysis };
      }
    };

    const createOutline = async (state: ProposalStateType) => {
      console.log('\n📝 STEP 2: CREATING DETAILED PROPOSAL OUTLINE...');
      console.log('📝 Using analysis with keys:', Object.keys(state.analysis || {}).join(', '));
      
      const outlinePrompt = `Based on the following comprehensive analysis, create a detailed business proposal outline:
      
      ANALYSIS:
      ${JSON.stringify(state.analysis, null, 2)}
      
      ORIGINAL REQUIREMENTS:
      ${state.requirements}
      
      Create a comprehensive business proposal outline with the following structure:
      
      1. EXECUTIVE SUMMARY
         - Project overview and value proposition
         - Key benefits and ROI
         - Recommended solution summary
      
      2. UNDERSTANDING OF REQUIREMENTS
         - Analysis of client needs
         - Project objectives
         - Success criteria
      
      3. PROPOSED SOLUTION
         - Technical approach
         - Methodology
         - Innovation and differentiation
      
      4. PROJECT DELIVERABLES
         - Detailed deliverables list
         - Quality standards
         - Acceptance criteria
      
      5. PROJECT TIMELINE & MILESTONES
         - Phase breakdown
         - Key milestones
         - Dependencies
      
      6. TEAM & EXPERTISE
         - Team composition
         - Relevant experience
         - Qualifications
      
      7. BUDGET & PRICING
         - Cost breakdown
         - Payment terms
         - Value justification
      
      8. RISK MANAGEMENT
         - Identified risks
         - Mitigation strategies
         - Contingency plans
      
      9. QUALITY ASSURANCE
         - QA processes
         - Testing approach
         - Performance metrics
      
      10. POST-IMPLEMENTATION SUPPORT
          - Maintenance plans
          - Training programs
          - Ongoing support
      
      Provide detailed content for each section, ensuring professional business language and compelling value propositions.`;

      const messages = [
        new SystemMessage("You are an expert proposal writer with 15+ years of experience in creating winning business proposals. Create comprehensive, professional outlines that address all client concerns and highlight competitive advantages."),
        new HumanMessage(outlinePrompt)
      ];

      const response = await this.model.invoke(messages);
      const parser = new StringOutputParser();
      const outline = await parser.invoke(response);

      console.log('📝 ✅ Proposal outline created successfully');
      console.log('📝 Outline length:', outline.length, 'characters');

      return { ...state, outline };
    };

    const generateProposal = async (state: ProposalStateType) => {
      console.log('\n📄 STEP 3: GENERATING COMPREHENSIVE BUSINESS PROPOSAL...');
      console.log('📄 Using outline of length:', state.outline.length, 'characters');
      
      const proposalPrompt = `Using the detailed analysis and outline provided, generate a comprehensive, professional business proposal document:
      
      PROJECT ANALYSIS:
      ${JSON.stringify(state.analysis, null, 2)}
      
      PROPOSAL OUTLINE:
      ${state.outline}
      
      ORIGINAL RFP REQUIREMENTS:
      ${state.requirements}
      
      Generate a complete business proposal document with the following specifications:
      
      1. Use professional business language and tone
      2. Include specific details and actionable items
      3. Address all RFP requirements comprehensively
      4. Highlight unique value propositions and competitive advantages
      5. Include realistic timelines and milestones
      6. Provide detailed cost justifications
      7. Address potential risks and mitigation strategies
      8. Include quality assurance measures
      9. Specify post-implementation support
      10. Use persuasive language to win the business
      
      Structure the proposal with clear headings, bullet points, and professional formatting.
      Make it compelling, detailed, and ready for client presentation.
      
      The proposal should be 3000-5000 words and cover all aspects thoroughly.`;

      const messages = [
        new SystemMessage(`You are a senior proposal writer and business development expert with 20+ years of experience. 
        You specialize in creating winning business proposals that secure contracts. 
        Your writing is persuasive, professional, and detail-oriented. 
        You understand how to address client concerns and highlight competitive advantages.
        Create a comprehensive business proposal that demonstrates deep understanding of the client's needs.`),
        new HumanMessage(proposalPrompt)
      ];

      const response = await this.model.invoke(messages);
      const parser = new StringOutputParser();
      const fullProposal = await parser.invoke(response);

      console.log('📄 ✅ Full proposal generated successfully');
      console.log('📄 Proposal length:', fullProposal.length, 'characters');
      console.log('📄 Estimated word count:', fullProposal.split(' ').length, 'words');

      return { ...state, fullProposal };
    };

    const reviewProposal = async (state: ProposalStateType) => {
      console.log('\n🔍 STEP 4: CONDUCTING COMPREHENSIVE PROPOSAL REVIEW...');
      console.log('🔍 Reviewing proposal of length:', state.fullProposal.length, 'characters');
      
      const reviewPrompt = `Conduct a thorough review of this business proposal against the original RFP requirements:
      
      ORIGINAL RFP REQUIREMENTS:
      ${state.requirements}
      
      PROJECT ANALYSIS:
      ${JSON.stringify(state.analysis, null, 2)}
      
      BUSINESS PROPOSAL:
      ${state.fullProposal}
      
      Provide a comprehensive review focusing on:
      
      1. COMPLETENESS CHECK:
         - Are all RFP requirements addressed?
         - Are there any missing sections or information?
         - Is the proposal comprehensive enough?
      
      2. TECHNICAL ACCURACY:
         - Are technical solutions feasible?
         - Are timelines realistic?
         - Are deliverables clearly defined?
      
      3. BUSINESS VALUE:
         - Is the value proposition clear and compelling?
         - Are benefits clearly articulated?
         - Is ROI demonstrated effectively?
      
      4. COMPETITIVE POSITIONING:
         - What makes this proposal stand out?
         - Are unique advantages highlighted?
         - How does it differentiate from competitors?
      
      5. LANGUAGE AND PRESENTATION:
         - Is the tone professional and persuasive?
         - Is the structure logical and easy to follow?
         - Are there any grammatical or clarity issues?
      
      6. RISK ASSESSMENT:
         - Are potential risks identified and addressed?
         - Are mitigation strategies reasonable?
         - Is the proposal realistic and achievable?
      
      7. IMPROVEMENT RECOMMENDATIONS:
         - What specific improvements would strengthen the proposal?
         - What additional information should be included?
         - How can the persuasiveness be enhanced?
      
      Provide specific, actionable feedback for improving the proposal.`;

      const messages = [
        new SystemMessage(`You are a senior proposal review expert and business consultant. 
        You have extensive experience evaluating business proposals and know what makes them successful. 
        You provide detailed, constructive feedback that helps create winning proposals. 
        Your reviews are thorough, practical, and focused on improving win rates.`),
        new HumanMessage(reviewPrompt)
      ];

      const response = await this.model.invoke(messages);
      const parser = new StringOutputParser();
      const review = await parser.invoke(response);

      console.log('🔍 ✅ Proposal review completed successfully');
      console.log('🔍 Review length:', review.length, 'characters');

      return { ...state, review };
    };

    const finalizeProposal = async (state: ProposalStateType) => {
      console.log('\n✅ STEP 5: FINALIZING COMPREHENSIVE BUSINESS PROPOSAL...');
      console.log('✅ Incorporating review feedback of length:', state.review.length, 'characters');
      
      const finalizePrompt = `Based on the comprehensive review feedback, create the final, polished version of this business proposal:
      
      ORIGINAL RFP REQUIREMENTS:
      ${state.requirements}
      
      PROJECT ANALYSIS:
      ${JSON.stringify(state.analysis, null, 2)}
      
      CURRENT PROPOSAL:
      ${state.fullProposal}
      
      DETAILED REVIEW FEEDBACK:
      ${state.review}
      
      Create the final, client-ready business proposal that:
      
      1. INCORPORATES ALL FEEDBACK:
         - Address all issues identified in the review
         - Enhance weak sections
         - Add missing information
         - Improve clarity and persuasiveness
      
      2. ENSURES PROFESSIONAL PRESENTATION:
         - Perfect grammar and professional language
         - Logical flow and clear structure
         - Compelling value propositions
         - Strong call-to-action
      
      3. MAXIMIZES WIN PROBABILITY:
         - Directly addresses all RFP requirements
         - Highlights competitive advantages
         - Demonstrates clear understanding of client needs
         - Provides specific, actionable solutions
      
      4. INCLUDES EXECUTIVE-LEVEL APPEAL:
         - Strong executive summary
         - Clear business benefits
         - ROI justification
         - Risk mitigation
      
      The final proposal should be a complete, professional document that stands out from competitors
      and positions our organization as the best choice for this project.
      
      Format it as a complete business proposal ready for client presentation.`;

      const messages = [
        new SystemMessage(`You are a senior proposal writer and business strategist with a proven track record of winning major contracts. 
        You excel at creating compelling, professional business proposals that resonate with decision-makers. 
        Your final proposals are polished, persuasive, and demonstrate clear value to clients. 
        You understand what executives look for and how to position solutions for maximum impact.`),
        new HumanMessage(finalizePrompt)
      ];

      const response = await this.model.invoke(messages);
      const parser = new StringOutputParser();
      const finalProposal = await parser.invoke(response);

      console.log('✅ ✅ FINAL PROPOSAL COMPLETED SUCCESSFULLY!');
      console.log('✅ Final proposal length:', finalProposal.length, 'characters');
      console.log('✅ Final proposal word count:', finalProposal.split(' ').length, 'words');
      console.log('✅ Estimated pages:', Math.ceil(finalProposal.split(' ').length / 250), 'pages');

      return { ...state, finalProposal };
    };

    // Create the workflow graph
    const workflow = new StateGraph(ProposalState);

    // Add nodes (using different names to avoid conflicts with state channels)
    workflow.addNode('analyzeNode', analyzeRequirements);
    workflow.addNode('outlineNode', createOutline);  
    workflow.addNode('generateNode', generateProposal);
    workflow.addNode('reviewNode', reviewProposal);
    workflow.addNode('finalizeNode', finalizeProposal);

    // Set entry point
    // @ts-ignore - LangGraph type definitions issue
    workflow.addEdge(START, 'analyzeNode');

    // Define the workflow flow
    // @ts-ignore - LangGraph type definitions issue
    workflow.addEdge('analyzeNode', 'outlineNode');
    // @ts-ignore - LangGraph type definitions issue
    workflow.addEdge('outlineNode', 'generateNode');
    // @ts-ignore - LangGraph type definitions issue
    workflow.addEdge('generateNode', 'reviewNode');
    // @ts-ignore - LangGraph type definitions issue
    workflow.addEdge('reviewNode', 'finalizeNode');
    // @ts-ignore - LangGraph type definitions issue
    workflow.addEdge('finalizeNode', END);

    this.workflow = workflow.compile();
  }

  async generateProposal(requirements: string): Promise<ProposalStateType> {
    const initialState: ProposalStateType = {
      requirements,
      analysis: null,
      outline: '',
      fullProposal: '',
      review: '',
      finalProposal: ''
    };

    console.log('\n' + '🚀'.repeat(20));
    console.log('🚀 STARTING COMPREHENSIVE PROPOSAL GENERATION WORKFLOW');
    console.log('🚀'.repeat(20));
    console.log('📋 Input Requirements Length:', requirements.length, 'characters');
    console.log('📋 Input Requirements Word Count:', requirements.split(' ').length, 'words');
    console.log('⏰ Started at:', new Date().toISOString());
    console.log('🚀'.repeat(50) + '\n');

    const result = await this.workflow.invoke(initialState);
    
    console.log('\n' + '✨'.repeat(20));
    console.log('✨ WORKFLOW COMPLETED SUCCESSFULLY!');
    console.log('✨'.repeat(20));
    console.log('📊 Final Results Summary:');
    console.log('  - Analysis:', result.analysis ? '✅ Complete' : '❌ Missing');
    console.log('  - Outline:', result.outline ? `✅ Complete (${result.outline.length} chars)` : '❌ Missing');
    console.log('  - Full Proposal:', result.fullProposal ? `✅ Complete (${result.fullProposal.length} chars)` : '❌ Missing');
    console.log('  - Review:', result.review ? `✅ Complete (${result.review.length} chars)` : '❌ Missing');
    console.log('  - Final Proposal:', result.finalProposal ? `✅ Complete (${result.finalProposal.length} chars)` : '❌ Missing');
    console.log('⏰ Completed at:', new Date().toISOString());
    console.log('✨'.repeat(50) + '\n');

    return result;
  }
}

export const proposalWorkflow = new ProposalWorkflow();
