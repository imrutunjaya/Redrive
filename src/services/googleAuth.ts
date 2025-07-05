declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive';

class GoogleAuthService {
  private gapi: any = null;
  private tokenClient: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if API credentials are properly configured
    if (!CLIENT_ID || !API_KEY || 
        CLIENT_ID.includes('your-actual-client-id') || 
        API_KEY.includes('your-actual-api-key')) {
      throw new Error('Google API credentials not configured. Please set VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY in your .env file with valid credentials from Google Cloud Console.');
    }

    return new Promise((resolve, reject) => {
      const script1 = document.createElement('script');
      script1.src = 'https://apis.google.com/js/api.js';
      script1.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://accounts.google.com/gsi/client';
        script2.onload = async () => {
          try {
            await this.initializeGapi();
            this.initializeGsi();
            this.isInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        script2.onerror = () => reject(new Error('Failed to load Google Sign-In client'));
        document.head.appendChild(script2);
      };
      script1.onerror = () => reject(new Error('Failed to load Google API client'));
      document.head.appendChild(script1);
    });
  }

  private async initializeGapi(): Promise<void> {
    await new Promise<void>((resolve) => {
      window.gapi.load('client', resolve);
    });

    try {
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
    } catch (error) {
      throw new Error(`Failed to initialize Google API client. Please verify your API key is valid and has access to Google Drive API. Error: ${error}`);
    }

    this.gapi = window.gapi;
  }

  private initializeGsi(): void {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // Will be set during sign-in
    });
  }

  async signIn(): Promise<{ user: any; accessToken: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          reject(resp);
          return;
        }

        try {
          // Set the access token
          this.gapi.client.setToken({ access_token: resp.access_token });

          // Get user info
          const userResponse = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${resp.access_token}`
          );
          const user = await userResponse.json();

          resolve({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              picture: user.picture,
            },
            accessToken: resp.access_token,
          });
        } catch (error) {
          reject(error);
        }
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  signOut(): void {
    const token = this.gapi?.client?.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      this.gapi.client.setToken('');
    }
  }

  setAccessToken(token: string): void {
    if (this.gapi?.client) {
      this.gapi.client.setToken({ access_token: token });
    }
  }

  getGapi() {
    return this.gapi;
  }
}

export const googleAuthService = new GoogleAuthService();