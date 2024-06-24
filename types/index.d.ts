import type { Enums, Tables } from './supabase';

export type RoleNames = Enums<'role_names'>;
export type UserStatuses = Enums<'user_statuses'>;

export type User = Tables<'Users'>;
export type Province = Tables<'Provinces'>;
export type City = Tables<'Cities'>;
export type Industry = Tables<'Industries'>;
export type Size = Tables<'Sizes'>;
export type Photo = Tables<'Photos'>;
export type Company = Tables<'Companies'>;
export type Organization = Tables<'Organizations'>;
export type Invitation = Tables<'Invitations'>;
export type Role = Tables<'Roles'>;
