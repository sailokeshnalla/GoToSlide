// src/lib/services/templateService.js
import { getTableForCategory } from '@/lib/categoryTables';

export async function fetchTemplates(category = 'All', searchQuery = '') {
  try {
    console.log("DIRECT FETCH START");

    const tableName = category !== 'All' ? getTableForCategory(category) : null;

    if (category !== 'All' && !tableName) {
      console.error(`No table mapped for category: ${category}`);
      return [];
    }

    // 'All' has no single shared table anymore — see note below.
    if (category === 'All') {
      console.warn('fetchTemplates("All") needs a defined behavior — see note.');
      return [];
    }

    let url = `https://mqxvtuyyzzdlihislvlb.supabase.co/rest/v1/${encodeURIComponent(tableName)}?order=created_at.desc&select=id,title,category,preview_image,download_url,tags,file_type,schema,created_at`;

    if (searchQuery) {
      url += `&title=ilike.*${encodeURIComponent(searchQuery)}*`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("RESPONSE STATUS:", response.status);

    const data = await response.json();

    console.log("DIRECT FETCH DATA:", data);

    return data || [];
  } catch (err) {
    console.error("DIRECT FETCH ERROR:", err);
    return [];
  }
}