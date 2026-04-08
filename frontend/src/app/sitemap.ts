import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fightmatch.duckdns.org';

async function fetchSlugs(path: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${process.env.API_INTERNAL_URL || 'http://backend:4000/api'}${path}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map((d: { slug: string }) => d.slug).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [gimnasioSlugs, arteSlugs, lesionSlugs, postSlugs] = await Promise.all([
    fetchSlugs('/gimnasios?limit=200'),
    fetchSlugs('/artes-marciales'),
    fetchSlugs('/lesiones'),
    fetchSlugs('/posts?limit=200'),
  ]);

  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,              lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/gimnasios`,       lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${BASE_URL}/artes-marciales`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/lesiones`,        lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/blog`,            lastModified: now, changeFrequency: 'daily',  priority: 0.8 },
    { url: `${BASE_URL}/buscar`,          lastModified: now, changeFrequency: 'monthly',priority: 0.6 },
  ];

  const gimnasioPages: MetadataRoute.Sitemap = gimnasioSlugs.map((slug) => ({
    url: `${BASE_URL}/gimnasios/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const artePages: MetadataRoute.Sitemap = arteSlugs.map((slug) => ({
    url: `${BASE_URL}/artes-marciales/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const lesionPages: MetadataRoute.Sitemap = lesionSlugs.map((slug) => ({
    url: `${BASE_URL}/lesiones/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const postPages: MetadataRoute.Sitemap = postSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...gimnasioPages, ...artePages, ...lesionPages, ...postPages];
}
