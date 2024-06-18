export interface Session {
    /**
     * The oauth provider token. If present, this can be used to make external API requests to the oauth provider used.
     */
    provider_token?: string | null;
    /**
     * The oauth provider refresh token. If present, this can be used to refresh the provider_token via the oauth provider's API.
     * Not all oauth providers return a provider refresh token. If the provider_refresh_token is missing, please refer to the oauth provider's documentation for information on how to obtain the provider refresh token.
     */
    provider_refresh_token?: string | null;
    /**
     * The access token jwt. It is recommended to set the JWT_EXPIRY to a shorter expiry value.
     */
    access_token: string;
    /**
     * A one-time used refresh token that never expires.
     */
    refresh_token: string;
    /**
     * The number of seconds until the token expires (since it was issued). Returned when a login is confirmed.
     */
    expires_in: number;
    /**
     * A timestamp of when the token will expire. Returned when a login is confirmed.
     */
    expires_at?: number;
    token_type: string;
    user: User;
}

interface UserAppMetadata {
    provider?: string;
    [key: string]: any;
}

interface UserMetadata {
    [key: string]: any;
}

interface UserIdentity {
    id: string;
    user_id: string;
    identity_data?: {
        [key: string]: any;
    };
    identity_id: string;
    provider: string;
    created_at?: string;
    last_sign_in_at?: string;
    updated_at?: string;
}

interface Factor {
    /** ID of the factor. */
    id: string;

    /** Friendly name of the factor, useful to disambiguate between multiple factors. */
    friendly_name?: string;

    /**
     * Type of factor. Only `totp` supported with this version but may change in
     * future versions.
     */
    factor_type: 'totp' | string;

    /** Factor's status. */
    status: 'verified' | 'unverified';

    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    app_metadata: UserAppMetadata;
    user_metadata: UserMetadata;
    aud: string;
    confirmation_sent_at?: string;
    recovery_sent_at?: string;
    email_change_sent_at?: string;
    new_email?: string;
    new_phone?: string;
    invited_at?: string;
    action_link?: string;
    email?: string;
    phone?: string;
    created_at: string;
    confirmed_at?: string;
    email_confirmed_at?: string;
    phone_confirmed_at?: string;
    last_sign_in_at?: string;
    role?: string;
    updated_at?: string;
    identities?: UserIdentity[];
    is_anonymous?: boolean;
    factors?: Factor[];
}
