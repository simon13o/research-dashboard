export function createCloudSyncTools({
  client,
  tables,
  normalizeRow,
  monthKey,
  normalizeExhibition,
  keyPart,
  brandProfileId
}) {
  const { fetchRows, upsertRows, deleteRows } = client;

  function salesPayload(rows) {
    return rows.map(normalizeRow).filter(row => row.brand || row.product || row.time).map(row => ({
      category:row.category || "Other",
      brand:row.brand || "",
      product:row.product || "",
      time:monthKey(row.time),
      sale_units:Math.max(0, Math.round(Number(row.saleUnits) || 0)),
      price:Number.isFinite(Number(row.price)) ? Math.max(0, Number(row.price)) : null,
      source_file:"dashboard_csv_upload",
      updated_at:new Date().toISOString()
    })).filter(row => row.time);
  }

  async function loadSales() {
    const rows = await fetchRows(tables.sales, "select=category,brand,product,time,sale_units,price&order=brand.asc,product.asc,time.asc");
    return Array.isArray(rows) ? rows.map(row => normalizeRow({ category:row.category, brand:row.brand, product:row.product, time:row.time, saleUnits:row.sale_units, price:row.price })).filter(row => row.brand || row.product || row.time) : null;
  }

  async function upsertSales(rows) {
    const payload = salesPayload(rows);
    return payload.length ? upsertRows(tables.sales, payload, "category,brand,product,time") : 0;
  }

  async function clearSales() {
    return deleteRows(tables.sales, "id=not.is.null");
  }

  function exhibitionPayload(rows) {
    return rows.map(normalizeExhibition).filter(row => row.showName || row.date || row.country).map(row => ({
      record_key:[row.showName, row.date, row.country, row.location].map(keyPart).join("||"),
      show_name:row.showName,
      date:row.date || null,
      country:row.country,
      location:row.location,
      sales_responsible:row.salesResponsible,
      category:row.category,
      business_model:row.businessModel,
      attendance:row.attendance,
      website:row.website,
      remark:row.remark,
      updated_at:new Date().toISOString()
    })).filter(row => row.record_key);
  }

  async function loadExhibitions() {
    const rows = await fetchRows(tables.exhibitions, "select=*&order=date.asc");
    return Array.isArray(rows) ? rows.map(row => normalizeExhibition({ showName:row.show_name, date:row.date, country:row.country, location:row.location, salesResponsible:row.sales_responsible, category:row.category, businessModel:row.business_model, attendance:row.attendance, website:row.website, remark:row.remark })).filter(row => row.showName || row.date || row.country) : null;
  }

  async function syncExhibitions(rows) {
    await clearExhibitions();
    return upsertRows(tables.exhibitions, exhibitionPayload(rows), "record_key");
  }

  async function clearExhibitions() { return deleteRows(tables.exhibitions, "record_key=not.is.null"); }

  function productInfoPayload(productIntro) {
    return Object.entries(productIntro).map(([key, intro]) => {
      const [brand = "", product = ""] = key.split("||");
      return { product_key:key, brand, product, text:String(intro?.text || ""), image_data_url:String(intro?.imageDataUrl || ""), updated_at:new Date().toISOString() };
    }).filter(row => row.brand || row.product || row.text || row.image_data_url);
  }

  async function loadProductInfo() {
    const rows = await fetchRows(tables.productInfo, "select=*");
    if(!Array.isArray(rows)) return null;
    return rows.reduce((intro, row) => {
      intro[String(row.product_key || `${row.brand || ""}||${row.product || ""}`)] = { text:String(row.text || ""), imageDataUrl:String(row.image_data_url || "") };
      return intro;
    }, {});
  }

  async function syncProductInfo(productIntro) {
    return upsertRows(tables.productInfo, productInfoPayload(productIntro), "product_key");
  }

  function brandProfilePayload(rows) {
    return rows.map((profile, index) => ({
      brand_id:String(profile.brand_id || brandProfileId(index)), brand_name:String(profile.brand_name || ""), hq_location:String(profile.hq_location || ""), official_site:String(profile.official_site || ""), key_products:Array.isArray(profile.key_products) ? profile.key_products : [], contact_name:String(profile.contact_name || ""), contact_position:String(profile.contact_position || ""), phones:Array.isArray(profile.phones) ? profile.phones : [], emails:Array.isArray(profile.emails) ? profile.emails : [], updated_at:new Date().toISOString()
    })).filter(row => row.brand_id && row.brand_name);
  }

  async function loadBrandProfiles() {
    const rows = await fetchRows(tables.brandProfiles, "select=*&order=brand_name.asc");
    return Array.isArray(rows) ? rows.map(row => ({ brand_id:row.brand_id, brand_name:row.brand_name, hq_location:row.hq_location, official_site:row.official_site, key_products:Array.isArray(row.key_products) ? row.key_products : [], contact_name:row.contact_name, contact_position:row.contact_position, phones:Array.isArray(row.phones) ? row.phones : [], emails:Array.isArray(row.emails) ? row.emails : [] })).filter(row => row.brand_name) : null;
  }

  async function syncBrandProfiles(rows) { return upsertRows(tables.brandProfiles, brandProfilePayload(rows), "brand_id"); }
  async function deleteBrandProfile(profile) {
    const id = encodeURIComponent(String(profile?.brand_id || ""));
    return id ? deleteRows(tables.brandProfiles, `brand_id=eq.${id}`) : false;
  }
  async function loadMarketReport() {
    const rows = await fetchRows(tables.reports, "select=*&report_key=eq.main&limit=1");
    return rows?.[0] ? String(rows[0].html_content || "") : null;
  }
  async function syncMarketReport(html) {
    return upsertRows(tables.reports, [{ report_key:"main", html_content:html || "", updated_at:new Date().toISOString() }], "report_key");
  }

  return { loadSales, upsertSales, clearSales, loadExhibitions, syncExhibitions, clearExhibitions, loadProductInfo, syncProductInfo, loadBrandProfiles, syncBrandProfiles, deleteBrandProfile, loadMarketReport, syncMarketReport };
}
