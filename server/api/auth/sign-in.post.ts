import { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient(event)
  const { email, password } = await readBody(event)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) return { error }

  return { data }
})