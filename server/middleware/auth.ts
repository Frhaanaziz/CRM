import { H3Event } from 'h3'
import { useAuth } from '~/.nuxt/imports'

export default defineEventHandler(async (event: H3Event) => {
  // // allow public access to auth routes
  // if (event.context.path.startsWith('/api/auth')) return
  //
  // // check user session
  // const user = useAuth()
  // if (!user.loggedIn) throw createError({ status: 401, statusMessage: 'Unauthorized' })
  //
  // return
})