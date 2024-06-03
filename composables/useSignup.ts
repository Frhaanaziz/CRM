import type { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

export const useSignUp = () => {
  type SignUpType = z.infer<typeof signUpSchema>

  const toast = useToast()
  const isSubmitting = ref(false)
  const state = ref<SignUpType>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })

  async function onSubmit(event: FormSubmitEvent<SignUpType>) {
    try {
      isSubmitting.value = true
      await $fetch('/api/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify(event.data),
      })

      toast.add({
        title: 'Success',
        description: 'Please check your email to verify your account.',
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 10000,
      })
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
