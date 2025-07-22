export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  has_notes_premium: boolean;
}

export interface LoginResponse extends User {
  token: string;
  refresh_token: string;
}

export interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  body: string;
  user_id: string;
}

export interface Team {
  team_id: string;
  created_at: string;
  updated_at: string;
  team_name: string;
  created_by: string;
  is_private: boolean;
}

export interface TeamNote {
  note_id: string;
  created_at: string;
  updated_at: string;
  body: string;
  user_id: string;
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  role: string;
}

export interface ApiError {
  error: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CreateNoteRequest {
  body: string;
  user_id: string;
}

export interface UpdateNoteRequest {
  noteID: string;
  body: string;
}

export interface CreateTeamRequest {
  team_name: string;
  user_id: string;
  is_private: boolean;
}

export interface AddTeamMemberRequest {
  user_id: string;
  role: string;
}

export interface CreateTeamNoteRequest {
  body: string;
  user_id: string;
}

export interface UpdateTeamNoteRequest {
  body: string;
}