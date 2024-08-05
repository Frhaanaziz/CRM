import type { Enums, Tables } from './supabase';

export type RoleNames = Enums<'role_names'>;
export type UserStatuses = Enums<'user_statuses'>;
export type ActivityTypes = Enums<'activity_types'>;
export type ActivityParticipantRoles = Enums<'activity_roles'>;
export type PriorityStatuses = Enums<'priority_statuses'>;
export type LeadSources = Enums<'source_name'>;

export type User = Tables<'Users'>;
export type Country = Tables<'Countries'>;
export type Province = Tables<'Provinces'>;
export type City = Tables<'Cities'>;
export type Industry = Tables<'Industries'>;
export type Size = Tables<'Sizes'>;
export type Photo = Tables<'Photos'>;
export type B2BCompany = Tables<'B2B_Companies'>;
export type Company = Tables<'Companies'>;
export type Organization = Tables<'Organizations'>;
export type Invitation = Tables<'Invitations'>;
export type Role = Tables<'Roles'>;
export type Contact = Tables<'Contacts'>;
export type Lead = Tables<'Leads'>;
export type Rating = Tables<'Ratings'>;
export type Task = Tables<'Tasks'>;
export type Opportunity = Tables<'Opportunities'>;
export type OpportunityStatus = Tables<'Opportunity_Statuses'>;
export type B2BContact = Tables<'B2B_Contacts'>;
export type Currency = Tables<'Currencies'>;
export type Activity = Tables<'Activities'>;
export type ActivityParticipant = Tables<'Activity_Participants'>;
export type Invitation = Tables<'Invitations'>;
export type TwilioSetting = Tables<'Twilio_Settings'>;
export type TwilioAgent = Tables<'Twilio_Agents'>;

export type PaginationUtils = {
    current_page: number;
    row_per_page: number;
    is_first_page: boolean;
    is_last_page: boolean;
    prev_page: number;
    next_page: number;
    total_row: number;
    total_page: number;
};
