import type { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

export const useSignUp = () => {
  type SignUpType = z.infer<typeof signUpSchema>

  const toast = useToast()
  const isSubmitting = ref(false)
  const initialForm = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  }
  const state = ref<SignUpType>(initialForm)

  async function onSubmit(event: FormSubmitEvent<SignUpType>) {
    try {
      isSubmitting.value = true
      await $fetch('/api/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify(event.data),
      })

      
      state.value = initialForm
      toast.add({
        title: 'Success',
        description: 'You have successfully created an account',
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 10000,
      })

      await navigateTo('/auth/signin', {replace: true})
    } catch (e) {
      console.error('Error creating account:', e)
      toast.add({
        title: 'Error',
        description: 'Failed to create account. Please try again later.',
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
