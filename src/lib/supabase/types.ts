export type UserRole = 'admin' | 'user'

export type AvatarKey =
  | 'avatar_utfpr_blue'
  | 'avatar_utfpr_green'
  | 'avatar_utfpr_gold'
  | 'avatar_competition'
  | 'avatar_academic'

export type TournamentCreatorRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export type CreatorPermissionStatus = 'active' | 'revoked'

export type TournamentStatus =
  | 'draft'
  | 'registrations_open'
  | 'registrations_closed'
  | 'ongoing'
  | 'finished'
  | 'cancelled'

export type RegistrationType = 'individual' | 'team'

export type TournamentRegistrationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'
  | 'checked_in'
  | 'registered'

export type Profile = {
  id: string
  email: string | null
  display_name: string
  ra: string | null
  avatar_key: AvatarKey
  role: UserRole
  created_at: string
  updated_at: string
}

export type TournamentCreatorRequest = {
  id: string
  user_id: string
  reason: string
  status: TournamentCreatorRequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type TournamentCreatorPermission = {
  id: string
  user_id: string
  status: CreatorPermissionStatus
  granted_by: string
  granted_at: string
  revoked_by: string | null
  revoked_at: string | null
  grant_reason: string | null
  revoke_reason: string | null
  created_at: string
  updated_at: string
}

export type Tournament = {
  id: string
  name: string
  slug: string
  modality: string
  description: string | null
  campus: string | null
  format: string
  status: TournamentStatus
  max_participants: number
  registration_type: RegistrationType
  team_min_size: number
  team_max_size: number
  starts_at: string | null
  ends_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type TournamentRegistration = {
  id: string
  tournament_id: string
  user_id: string
  display_name: string
  status: TournamentRegistrationStatus
  registration_type: RegistrationType
  captain_user_id: string | null
  admin_notes: string | null
  decided_by: string | null
  decided_at: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Omit<Profile, 'created_at' | 'updated_at'>> &
          Pick<Profile, 'id'>
        Update: Partial<
          Pick<Profile, 'display_name' | 'ra' | 'avatar_key' | 'role' | 'email'>
        >
        Relationships: []
      }
      tournament_creator_requests: {
        Row: TournamentCreatorRequest
        Insert: Pick<TournamentCreatorRequest, 'user_id' | 'reason'> &
          Partial<
            Pick<
              TournamentCreatorRequest,
              'status' | 'reviewed_by' | 'reviewed_at' | 'admin_notes'
            >
          >
        Update: Partial<
          Pick<
            TournamentCreatorRequest,
            'status' | 'reviewed_by' | 'reviewed_at' | 'admin_notes'
          >
        >
        Relationships: []
      }
      tournament_creator_permissions: {
        Row: TournamentCreatorPermission
        Insert: Pick<
          TournamentCreatorPermission,
          'user_id' | 'status' | 'granted_by'
        > &
          Partial<
            Pick<
              TournamentCreatorPermission,
              | 'granted_at'
              | 'revoked_by'
              | 'revoked_at'
              | 'grant_reason'
              | 'revoke_reason'
            >
          >
        Update: Partial<
          Pick<
            TournamentCreatorPermission,
            'status' | 'revoked_by' | 'revoked_at' | 'revoke_reason'
          >
        >
        Relationships: []
      }
      tournaments: {
        Row: Tournament
        Insert: Pick<
          Tournament,
          'name' | 'slug' | 'modality' | 'format' | 'status' | 'created_by'
        > &
          Partial<
            Pick<
              Tournament,
              | 'description'
              | 'campus'
              | 'max_participants'
              | 'registration_type'
              | 'team_min_size'
              | 'team_max_size'
              | 'starts_at'
              | 'ends_at'
            >
          >
        Update: Partial<
          Pick<
            Tournament,
            | 'name'
            | 'slug'
            | 'modality'
            | 'description'
            | 'campus'
            | 'format'
            | 'status'
            | 'max_participants'
            | 'registration_type'
            | 'team_min_size'
            | 'team_max_size'
            | 'starts_at'
            | 'ends_at'
          >
        >
        Relationships: []
      }
      tournament_registrations: {
        Row: TournamentRegistration
        Insert: Pick<
          TournamentRegistration,
          'tournament_id' | 'user_id' | 'display_name'
        > &
          Partial<
            Pick<
              TournamentRegistration,
              'status' | 'registration_type' | 'captain_user_id'
            >
          >
        Update: Partial<
          Pick<
            TournamentRegistration,
            | 'display_name'
            | 'status'
            | 'admin_notes'
            | 'decided_by'
            | 'decided_at'
            | 'cancelled_by'
            | 'cancelled_at'
          >
        >
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      can_create_tournament: {
        Args: {
          target_user_id?: string
        }
        Returns: boolean
      }
      can_create_tournaments: {
        Args: {
          target_user_id?: string
        }
        Returns: boolean
      }
      can_manage_tournament: {
        Args: {
          target_tournament_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      request_status: TournamentCreatorRequestStatus
      creator_permission_status: CreatorPermissionStatus
      tournament_status: TournamentStatus
      tournament_registration_status: TournamentRegistrationStatus
      registration_type: RegistrationType
    }
    CompositeTypes: Record<string, never>
  }
}
