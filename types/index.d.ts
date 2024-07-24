import type { Enums, Tables } from './supabase';

export type RoleNames = Enums<'role_names'>;
export type UserStatuses = Enums<'user_statuses'>;
export type LeadStatuses = Enums<'lead_statuses'>;
export type ActivityTypes = Enums<'activity_types'>;
export type ActivityParticipantRoles = Enums<'activity_roles'>;
export type PriorityStatuses = Enums<'priority_statuses'>;

export type User = Tables<'Users'>;
export type Country = Tables<'Countries'>;
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
export type DisqualifyReason = Tables<'Disqualify_Reasons'>;
export type Rating = Tables<'Ratings'>;
export type Task = Tables<'Tasks'>;
export type Opportunity = Tables<'Opportunities'>;
export type OpportunityStatus = Tables<'Opportunity_Statuses'>;
export type B2BContact = Tables<'B2B_Contacts'>;
export type Source = Tables<'Sources'>;
export type Currency = Tables<'Currencies'>;
export type PaymentPlan = Tables<'Payment_Plans'>;
export type Activity = Tables<'Activities'>;
export type ActivityParticipant = Tables<'Activity_Participants'>;

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
