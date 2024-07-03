import type { Enums, Tables } from './supabase';

export type RoleNames = Enums<'role_names'>;
export type UserStatuses = Enums<'user_statuses'>;
export type LeadStatuses = Enums<'lead_statuses'>;

export type User = Tables<'Users'>;
export type Province = Tables<'Provinces'>;
export type City = Tables<'Cities'>;
export type Industry = Tables<'Industries'>;
export type Size = Tables<'Sizes'>;
export type Photo = Tables<'Photos'>;
export type B2BCompany = Tables<'B2B_Companies'>;
export type Company = Tables<'Companies'>;
export type CompanyStatus = Tables<'Company_Statuses'>;
export type Organization = Tables<'Organizations'>;
export type Invitation = Tables<'Invitations'>;
export type Role = Tables<'Roles'>;
export type Contact = Tables<'Contacts'>;
export type ContactStatus = Tables<'Contact_Statuses'>;
export type Lead = Tables<'Leads'>;
export type LeadStatus = Tables<'Lead_Statuses'>;
export type DisqualifyReason = Tables<'Disqualify_Reasons'>;
export type Rating = Tables<'Ratings'>;
export type Task = Tables<'Tasks'>;
export type Opportunity = Tables<'Opportunities'>;
export type OpportunityStatus = Tables<'Opportunity_Statuses'>;
