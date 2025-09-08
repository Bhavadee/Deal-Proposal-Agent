import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export class LangChainService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateProposal(requirements: string): Promise<string> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage("You are an expert proposal writer. Generate professional and compelling proposals based on the given requirements."),
        new HumanMessage(`Generate a proposal for: ${requirements}`)
      ]);

      const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
      const result = await chain.invoke({ requirements });
      
      return result;
    } catch (error) {
      console.error('Error generating proposal:', error);
      throw new Error('Failed to generate proposal');
    }
  }

  async analyzeRequirements(text: string): Promise<{
    keywords: string[];
    complexity: string;
    estimatedBudget: string;
    timeline: string;
  }> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage(`You are an expert project analyzer. Analyze the given requirements and return a JSON response with:
        - keywords: array of important keywords
        - complexity: "low", "medium", or "high"
        - estimatedBudget: rough budget estimate
        - timeline: estimated project timeline
        
        Return only valid JSON without any additional text.`),
        new HumanMessage(`Analyze these requirements: ${text}`)
      ]);

      const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
      const result = await chain.invoke({ text });
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Error analyzing requirements:', error);
      throw new Error('Failed to analyze requirements');
    }
  }
}

export const langchainService = new LangChainService();
