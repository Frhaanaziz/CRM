import { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient(event)

  // allow public access to auth routes
  if (event.path.startsWith('/api/auth')) return

  // check headers for user
  const token = event.headers.get('Authorization')?.split(' ')[1]
  if (!token) throw createError({ status: 401, statusMessage: 'Unauthorized' })

  await jwt.verify(token, process.env.JWT_SECRET!, async (err: any, decoded: any) => {
    if (err) throw createError({ status: 401, statusMessage: 'Unauthorized' })

    // get user id from decoded token
    const userId = decoded.id

    // get user from supabase
    const { error } = await supabase.from('Users').select().eq('id', userId).single()
    if (error) throw createError({ status: 401, statusMessage: 'Unauthorized' })
  })

  return
})