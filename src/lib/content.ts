import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import type { Locale } from './i18n';

export interface LocalizedEntry<C extends CollectionKey> {
  slug: string;
  entry: CollectionEntry<C>;
  language: Locale;
}

export async function getLocalizedCollection<C extends CollectionKey>(collection: C, locale: Locale) {
  const entries = await getCollection(collection);
  const entriesBySlug = new Map<string, LocalizedEntry<C>>();

  for (const entry of entries) {
    const language = entry.id.startsWith('en/') ? 'en' : 'zh-CN';
    const slug = language === 'en' ? entry.id.slice(3) : entry.id;

    if (!entriesBySlug.has(slug) || language === locale) {
      entriesBySlug.set(slug, { slug, entry, language });
    }
  }

  return [...entriesBySlug.values()].sort(
    (a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime(),
  );
}

export async function getLocalizedPaths<C extends CollectionKey>(collection: C, locale: Locale) {
  const items = await getLocalizedCollection(collection, locale);
  return items.map((item) => ({
    params: { id: item.slug },
    props: { item },
  }));
}
