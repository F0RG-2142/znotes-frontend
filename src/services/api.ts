import { 
  User, 
  LoginResponse, 
  Note, 
  Team, 
  TeamNote, 
  TeamMember,
  LoginRequest, 
  RegisterRequest, 
  CreateNoteRequest, 
  UpdateNoteRequest,
  CreateTeamRequest,
  AddTeamMemberRequest,
  CreateTeamNoteRequest,
  UpdateTeamNoteRequest
} from '../types/api';

// Configure your backend base URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokens();
  }

  private loadTokens() {
    this.token = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers) ? options.headers as Record<string, string> : {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 errors by attempting token refresh
    if (response.status === 401 && this.refreshToken && endpoint !== '/api/v1/token/refresh') {
      try {
        await this.refreshAccessToken();
        // Retry the original request with new token
        headers.Authorization = `Bearer ${this.token}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
        });
        return this.handleResponse<T>(retryResponse);
      } catch (error) {
        this.clearTokens();
        window.location.href = '/login';
        throw error;
      }
    }

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Authentication endpoints
  async register(userData: RegisterRequest): Promise<void> {
    return this.request<void>('/api/v1/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/v1/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.saveTokens(response.token, response.refresh_token);
    localStorage.setItem('user', JSON.stringify({
      id: response.id,
      email: response.email,
      created_at: response.created_at,
      updated_at: response.updated_at,
      has_notes_premium: response.has_notes_premium,
    }));

    return response;
  }

  async logout(): Promise<void> {
    if (this.token) {
      await this.request<void>('/api/v1/logout', {
        method: 'POST',
      });
    }
    this.clearTokens();
  }

  async refreshAccessToken(): Promise<{ token: string }> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/api/v1/token/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.refreshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('access_token', data.token);

    return data;
  }

  async updateUser(userData: { email: string; password: string }): Promise<User> {
    return this.request<User>('/api/v1/user/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Private Notes endpoints
  async createNote(noteData: CreateNoteRequest): Promise<void> {
    return this.request<void>('/api/v1/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getNotesByAuthor(authorId: string): Promise<Note[]> {
    return this.request<Note[]>(`/api/v1/notes?authorId=${authorId}`);
  }

  async getNote(noteId: string): Promise<Note> {
    return this.request<Note>(`/api/v1/notes/${noteId}`);
  }

  async updateNote(noteId: string, noteData: UpdateNoteRequest): Promise<void> {
    return this.request<void>(`/api/v1/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    return this.request<void>(`/api/v1/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Teams endpoints
  async createTeam(teamData: CreateTeamRequest): Promise<void> {
    return this.request<void>('/api/v1/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  }

  async getAllTeams(): Promise<Team[]> {
    return this.request<Team[]>('/api/v1/teams');
  }

  async getTeam(teamId: string): Promise<Team> {
    return this.request<Team>(`/api/v1/teams/${teamId}?team_id=${teamId}`);
  }

  async deleteTeam(teamId: string): Promise<void> {
    return this.request<void>(`/api/v1/teams/${teamId}?team_id=${teamId}`, {
      method: 'DELETE',
    });
  }

  async addTeamMember(teamId: string, memberData: AddTeamMemberRequest): Promise<void> {
    return this.request<void>(`/api/v1/teams/${teamId}/members?team_id=${teamId}`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async removeTeamMember(teamId: string, memberId: string): Promise<void> {
    return this.request<void>(`/api/v1/teams/${teamId}/members/${memberId}?team_id=${teamId}`, {
      method: 'DELETE',
    });
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.request<TeamMember[]>(`/api/v1/teams/${teamId}/members?team_id=${teamId}`);
  }

  // Team Notes endpoints
  async createTeamNote(teamId: string, noteData: CreateTeamNoteRequest): Promise<void> {
    return this.request<void>(`/api/v1/teams/${teamId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async getTeamNotes(teamId: string): Promise<TeamNote[]> {
    return this.request<TeamNote[]>(`/api/v1/teams/${teamId}/notes`);
  }

  async getTeamNote(teamId: string, noteId: string): Promise<TeamNote> {
    return this.request<TeamNote>(`/api/v1/teams/${teamId}/notes/${noteId}`);
  }

  async updateTeamNote(teamId: string, noteId: string, noteData: UpdateTeamNoteRequest): Promise<void> {
    return this.request<void>(`/api/v1/teams/${teamId}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteTeamNote(teamId: string, noteId: string): Promise<void> {
    return this.request<void>(`/api/v1/teams/${teamId}/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const apiService = new ApiService(API_BASE_URL);