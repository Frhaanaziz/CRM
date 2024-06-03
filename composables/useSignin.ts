import type { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

export const useSignIn = () => {
  type SignInType = z.infer<typeof signInSchema>

  const toast = useToast()
  const isSubmitting = ref(false)
  const state = ref<SignInType>({
    email: 'asdf@ads.asd',
    password: 'asdfasdf',
  })

  async function onSubmit(event: FormSubmitEvent<SignInType>) {
    try {
      isSubmitting.value = true
      await $fetch('/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify(event.data),
      })

      toast.add({
        title: 'Success',
        description: 'You have successfully signed in.',
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 10000,
      })

      await navigateTo('/dashboard', {
        replace: true,
      })
    } catch (e) {
      console.log('Error signing in:', e)
      toast.add({
        title: 'Error',
        description: getErrorMessage(e),
        icon: 'i-heroicons-x-circle',
        color: 'red',
      })
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    state,
    isSubmitting,
    submit: onSubmit,
  }
}
