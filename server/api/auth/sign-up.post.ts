import { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { signUpSchema } from '~/utils/validators/auth'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient(event)

  const body = await readValidatedBody(event, signUpSchema.safeParse)
  if (!body.success) {
    let errors = ''
    for (const issue in body.error.issues) {
      if (Number(issue) === body.error.issues.length - 1) {
        errors += `${body.error.issues[issue].message}`
      } else {
        errors += `${body.error.issues[issue].message}, `
      }
    }
    throw createError({ status: 400, statusMessage: errors })
  }

  const { email, password, password_confirmation, first_name, last_name, phone } = body.data
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name,
        phone
      }
    }
  })
  if (error) throw createError({ status: 400, statusMessage: error.message })

  return { data }
})