export type AccessTokenResponse = {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

export type CreateUserResponse = {
  id: string
  created: boolean
  identities: [
    {
      type: string
      result: {
        created: boolean
      }
    }
  ]
}