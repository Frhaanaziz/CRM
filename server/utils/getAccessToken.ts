import { AccessTokenResponse } from '~/types/kinde'

export const getAccessToken = async (): Promise<string | undefined> => {
  const response: AccessTokenResponse = await $fetch(`${process.env.KINDE_API_URL}/oauth2/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      audience: `${process.env.KINDE_API_URL}/api`,
      grant_type: 'client_credentials',
      client_id: `${process.env.KINDE_CLIENT_ID}`,
      client_secret: `${process.env.KINDE_CLIENT_SECRET}`
    })
  })

  return response.access_token
}