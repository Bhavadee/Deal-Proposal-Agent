import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleOAuthService {
  private oauth2Client: OAuth2Client | null = null;
  private scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  private initializeClient() {
    if (!this.oauth2Client) {
      console.log('GoogleOAuthService initializing - Environment check:');
      console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
      console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
      console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || 'NOT SET');
      
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback'
      );
    }
    return this.oauth2Client;
  }

  /**
   * Generate Google OAuth URL for authorization
   */
  getAuthUrl(): string {
    const client = this.initializeClient();
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    try {
      const client = this.initializeClient();
      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting OAuth tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(tokens: any) {
    const client = this.initializeClient();
    client.setCredentials(tokens);
  }

  /**
   * Get user profile information
   */
  async getUserProfile() {
    try {
      const client = this.initializeClient();
      const oauth2 = google.oauth2({ version: 'v2', auth: client });
      const response = await oauth2.userinfo.get();
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * List files in Google Drive
   */
  async listDriveFiles(pageToken?: string, query?: string) {
    try {
      const client = this.initializeClient();
      const drive = google.drive({ version: 'v3', auth: client });
      
      const params: any = {
        pageSize: 50,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink)',
        orderBy: 'modifiedTime desc'
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      if (query) {
        params.q = query;
      }

      const response = await drive.files.list(params);
      return response.data;
    } catch (error) {
      console.error('Error listing Drive files:', error);
      throw new Error('Failed to list Drive files');
    }
  }

  /**
   * Get file metadata from Google Drive
   */
  async getFileMetadata(fileId: string) {
    try {
      const client = this.initializeClient();
      const drive = google.drive({ version: 'v3', auth: client });
      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, parents'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error('Failed to get file metadata');
    }
  }

  /**
   * Download file content from Google Drive
   */
  async downloadFile(fileId: string) {
    try {
      const client = this.initializeClient();
      const drive = google.drive({ version: 'v3', auth: client });
      const response = await drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' });
      
      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  /**
   * Search for PDF files in Google Drive
   */
  async searchPDFFiles(searchTerm?: string) {
    try {
      let query = "mimeType='application/pdf'";
      
      if (searchTerm) {
        query += ` and name contains '${searchTerm}'`;
      }

      return await this.listDriveFiles(undefined, query);
    } catch (error) {
      console.error('Error searching PDF files:', error);
      throw new Error('Failed to search PDF files');
    }
  }

  /**
   * Export Google Docs as plain text
   */
  async exportGoogleDoc(fileId: string): Promise<Buffer> {
    try {
      if (!this.oauth2Client) {
        this.initializeClient();
      }
      const drive = google.drive({ version: 'v3', auth: this.oauth2Client! });
      const response = await drive.files.export({
        fileId,
        mimeType: 'text/plain'
      }, { responseType: 'arraybuffer' });
      
      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      console.error('Error exporting Google Doc:', error);
      throw new Error('Failed to export Google Doc');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const client = this.initializeClient();
      client.setCredentials({
        refresh_token: refreshToken
      });
      
      const { credentials } = await client.refreshAccessToken();
      return credentials;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh access token');
    }
  }
}

export const googleOAuthService = new GoogleOAuthService();
