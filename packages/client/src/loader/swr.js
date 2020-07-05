import { idle } from '../polyfills';

/**
 * TODO: Add config:
 * - cache deletion
 * - no cache
 * - refresh / revalidate
 * - timeout -> revalidate after n ms
 */
export const swrImport = async (url, {
  onError,
  onDone,
  cache: cacheOptions,
}) => {
  console.log('cache');
  const cacheStorage = await caches.open('__REMOTE_COMPONENTS__v1');
  const cachedResponse = await cacheStorage.match(url);

  if (cachedResponse?.ok) {
    onDone(await cachedResponse.text());
  }

  // TODO: add timeouts
  idle(async () => {
    try {
      if (!cacheOptions.refetch) return;
      if (!navigator.onLine) return;

      const request = new Request(url);
      const response = await fetch(request);

      cacheStorage.put(request, response.clone());

      if (!cacheOptions.rerender) return;

      onDone(await response.text());
    } catch {
      onError(new URIError(`Error while loading ${url}`));
    }
  });
};
