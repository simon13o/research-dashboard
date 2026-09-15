export function createSupabaseClient({ url, publishableKey }){
  const headers = () => ({
    apikey:publishableKey,
    Authorization:`Bearer ${publishableKey}`,
    Accept:"application/json"
  });

  const readError = async response => await response.text().catch(() => "");

  async function fetchRows(table, query = "select=*"){
    const response = await fetch(`${url}/rest/v1/${table}?${query}`, { headers:headers() });
    if(response.status === 404) return null;
    if(!response.ok) throw new Error(`Supabase ${table} load failed: ${response.status} ${await readError(response)}`);
    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  }

  async function upsertRows(table, rows, conflictKey){
    const payload = Array.isArray(rows) ? rows : [];
    if(!payload.length) return 0;
    const chunkSize = 300;
    let count = 0;
    for(let i=0;i<payload.length;i+=chunkSize){
      const chunk = payload.slice(i, i + chunkSize);
      const response = await fetch(`${url}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictKey)}`, {
        method:"POST",
        headers:{ ...headers(), "Content-Type":"application/json", Prefer:"resolution=merge-duplicates,return=minimal" },
        body:JSON.stringify(chunk)
      });
      if(!response.ok) throw new Error(`Supabase ${table} upsert failed: ${response.status} ${await readError(response)}`);
      count += chunk.length;
    }
    return count;
  }

  async function deleteRows(table, filter){
    const response = await fetch(`${url}/rest/v1/${table}?${filter}`, {
      method:"DELETE",
      headers:{ ...headers(), Prefer:"return=minimal" }
    });
    if(!response.ok) throw new Error(`Supabase ${table} delete failed: ${response.status} ${await readError(response)}`);
    return true;
  }

  function publicStorageUrl(bucket, path){
    const encodedPath = String(path || "").split("/").map(encodeURIComponent).join("/");
    return `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
  }

  async function uploadStorageFile(bucket, file, folder){
    if(!file) return "";
    const safeName = String(file.name || "file").replace(/[^\w.\-]+/g, "_");
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2,9)}_${safeName}`;
    const encodedPath = path.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
      method:"POST",
      headers:{ ...headers(), "Content-Type":file.type || "application/octet-stream", "x-upsert":"true" },
      body:file
    });
    if(!response.ok) throw new Error(`Supabase storage upload failed: ${response.status} ${await readError(response)}`);
    return publicStorageUrl(bucket, path);
  }

  return { headers, fetchRows, upsertRows, deleteRows, publicStorageUrl, uploadStorageFile };
}
