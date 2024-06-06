import { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { Database } from '~/types/supabase'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  // get user id from params
  const id = event.context.params?.id
  if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' })

  // get user from supabase
  const { data: user, error } = await supabase.from('Users').select('*').eq('id', id).single()
  if (error) throw createError({ status: 500, statusMessage: error.message })

  return user
})