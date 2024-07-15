export const userStatuses = ['active', 'inactive'] as const;
export const roleNames = ['owner', 'admin', 'manager', 'sales'] as const;
export const leadStatuses = ['new', 'contacted', 'qualified', 'disqualified'] as const;
export const activityTypes = [
    'qualified',
    'disqualified',
    'note',
    'email',
    'closed as won',
    'closed as lost',
    'reopened',
    'calling',
    'assigned',
] as const;

export const supportEmail = 'anthony@nocodemagician.com';
