export * from './validators/auth'

export function getErrorMessage(error: unknown): string {
  let message: string

  if (error && typeof error === 'object' && 'statusMessage' in error) {
    message = String(error.statusMessage)
  } else if (error instanceof Error) {
    message = error.message
  } else if (typeof error === 'string') {
    message = error
  } else {
    message = 'Something went wrong, please try again later.'
  }

  return message
}
