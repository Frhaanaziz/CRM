import { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient(event)
  const { email, password, confirmPassword, firstName, lastName, phone } = await readBody(event)

  if (password !== confirmPassword) return { error: 'Passwords do not match' }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName,
        lastName,
        phone
      }
    }
  })
  if (error) return { error }

  return { data }
})