export type AccessTokenResponse = {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
};

export type CreateUserResponse = {
    id: string;
    created: boolean;
    identities: [
        {
            type: string;
            result: {
                created: boolean;
            };
        },
    ];
};

export type KindeUser = {
    id: string;
    sub: string;
    name: string;
    email: string;
    picture: string | null;
    given_name: string;
    updated_at: number;
    family_name: string;
    preferred_username: string | null;
};

export type KindeAuthState = {
    loggedIn: boolean;
    user: KindeUser;
};
