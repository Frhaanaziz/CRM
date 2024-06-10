import type { UseFetchOptions } from 'nuxt/app'

/**
 * Custom hook for making API requests.
 *
 * @template T - The type of the response data.
 * @param {MaybeRefOrGetter<string>} url - The URL for the API request.
 * @param {UseFetchOptions<T>} [options={}] - Additional options for the API request.
 * @returns {UseFetchReturn<T>} - The response data and other fetch-related properties.
 */
export function useAPI<T>(
  url: MaybeRefOrGetter<string>,
  options: UseFetchOptions<T> = {},
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api,
  })
}