import { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  const supabase = await serverSupabaseClient(event)

  // get user id from params
  const id = event.context.params?.id
  if (!id) throw createError({ status: 400, statusMessage: 'User id is needed' })

  const formData = await readFormData(event)
  const photo: File = formData.get('photo') as File
  const firstName: string = formData.get('firstName') as string
  const lastName: string = formData.get('lastName') as string
  const phone: string = formData.get('phone') as string
  const linkedin: string = formData.get('linkedin') as string

  const { data: uploadPath, error: uploadError } = await supabase.storage.from('avatars').upload(`${photo.name}${id}`, photo)
  if (uploadError) throw createError({ status: 500, statusMessage: uploadError.message })

  const { data: { user }, error: updateError } = await supabase.auth.updateUser({
    data: {
      firstName,
      lastName,
      phone,
      linkedin,
      photo: uploadPath?.path
    }
  })
  if (updateError) throw createError({ status: 500, statusMessage: updateError.message })

  const response = {
    photo: user?.user_metadata.photo || '',
    email: user?.email,
    firstName: user?.user_metadata.firstName,
    lastName: user?.user_metadata.lastName,
    phone: user?.user_metadata.phone,
    linkedin: user?.user_metadata.linkedin || ''
  }

  return { data: response }
})