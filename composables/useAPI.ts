import type { UseFetchOptions } from 'nuxt/app'

export function useAPI<T>(
  url: MaybeRefOrGetter<string>,
  options: UseFetchOptions<T> = {},
) {
  return useFetch(url, {
    ...options,
    $fetch: useNuxtApp().$api,
  })
}