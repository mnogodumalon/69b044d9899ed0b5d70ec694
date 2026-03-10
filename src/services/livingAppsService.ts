// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS, LOOKUP_OPTIONS, FIELD_TYPES } from '@/types/app';
import type { Kunden, Berater, Leistungskatalog, Projekte, Angebote, Rechnungen, Rechnungsliste } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: unknown): string | null {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

/** Upload a file to LivingApps. Returns the file URL for use in record fields. */
export async function uploadFile(file: File | Blob, filename?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file, filename ?? (file instanceof File ? file.name : 'upload'));
  const res = await fetch(`${API_BASE_URL}/files`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(`File upload failed: ${res.status}`);
  const data = await res.json();
  return data.url;
}

function enrichLookupFields<T extends { fields: Record<string, unknown> }>(
  records: T[], entityKey: string
): T[] {
  const opts = LOOKUP_OPTIONS[entityKey];
  if (!opts) return records;
  return records.map(r => {
    const fields = { ...r.fields };
    for (const [fieldKey, options] of Object.entries(opts)) {
      const val = fields[fieldKey];
      if (typeof val === 'string') {
        const m = options.find(o => o.key === val);
        fields[fieldKey] = m ?? { key: val, label: val };
      } else if (Array.isArray(val)) {
        fields[fieldKey] = val.map(v => {
          if (typeof v === 'string') {
            const m = options.find(o => o.key === v);
            return m ?? { key: v, label: v };
          }
          return v;
        });
      }
    }
    return { ...r, fields } as T;
  });
}

/** Normalize fields for API writes: strip lookup objects to keys, fix date formats. */
export function cleanFieldsForApi(
  fields: Record<string, unknown>,
  entityKey: string
): Record<string, unknown> {
  const clean: Record<string, unknown> = { ...fields };
  for (const [k, v] of Object.entries(clean)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && 'key' in v) clean[k] = (v as any).key;
    if (Array.isArray(v)) clean[k] = v.map((item: any) => item && typeof item === 'object' && 'key' in item ? item.key : item);
  }
  const types = FIELD_TYPES[entityKey];
  if (types) {
    for (const [k, ft] of Object.entries(types)) {
      const val = clean[k];
      if (typeof val !== 'string' || !val) continue;
      if (ft === 'date/datetimeminute') clean[k] = val.slice(0, 16);
      else if (ft === 'date/date') clean[k] = val.slice(0, 10);
    }
  }
  return clean;
}

let _cachedUserProfile: Record<string, unknown> | null = null;

export async function getUserProfile(): Promise<Record<string, unknown>> {
  if (_cachedUserProfile) return _cachedUserProfile;
  const raw = await callApi('GET', '/user');
  const skip = new Set(['id', 'image', 'lang', 'gender', 'title', 'fax', 'menus', 'initials']);
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v != null && !skip.has(k)) data[k] = v;
  }
  _cachedUserProfile = data;
  return data;
}

export class LivingAppsService {
  // --- KUNDEN ---
  static async getKunden(): Promise<Kunden[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KUNDEN}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Kunden[];
    return enrichLookupFields(records, 'kunden');
  }
  static async getKundenEntry(id: string): Promise<Kunden | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KUNDEN}/records/${id}`);
    const record = { record_id: data.id, ...data } as Kunden;
    return enrichLookupFields([record], 'kunden')[0];
  }
  static async createKundenEntry(fields: Kunden['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KUNDEN}/records`, { fields });
  }
  static async updateKundenEntry(id: string, fields: Partial<Kunden['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KUNDEN}/records/${id}`, { fields });
  }
  static async deleteKundenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KUNDEN}/records/${id}`);
  }

  // --- BERATER ---
  static async getBerater(): Promise<Berater[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.BERATER}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Berater[];
    return enrichLookupFields(records, 'berater');
  }
  static async getBeraterEntry(id: string): Promise<Berater | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.BERATER}/records/${id}`);
    const record = { record_id: data.id, ...data } as Berater;
    return enrichLookupFields([record], 'berater')[0];
  }
  static async createBeraterEntry(fields: Berater['fields']) {
    return callApi('POST', `/apps/${APP_IDS.BERATER}/records`, { fields });
  }
  static async updateBeraterEntry(id: string, fields: Partial<Berater['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.BERATER}/records/${id}`, { fields });
  }
  static async deleteBeraterEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.BERATER}/records/${id}`);
  }

  // --- LEISTUNGSKATALOG ---
  static async getLeistungskatalog(): Promise<Leistungskatalog[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Leistungskatalog[];
    return enrichLookupFields(records, 'leistungskatalog');
  }
  static async getLeistungskatalogEntry(id: string): Promise<Leistungskatalog | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records/${id}`);
    const record = { record_id: data.id, ...data } as Leistungskatalog;
    return enrichLookupFields([record], 'leistungskatalog')[0];
  }
  static async createLeistungskatalogEntry(fields: Leistungskatalog['fields']) {
    return callApi('POST', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records`, { fields });
  }
  static async updateLeistungskatalogEntry(id: string, fields: Partial<Leistungskatalog['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records/${id}`, { fields });
  }
  static async deleteLeistungskatalogEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.LEISTUNGSKATALOG}/records/${id}`);
  }

  // --- PROJEKTE ---
  static async getProjekte(): Promise<Projekte[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.PROJEKTE}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Projekte[];
    return enrichLookupFields(records, 'projekte');
  }
  static async getProjekteEntry(id: string): Promise<Projekte | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.PROJEKTE}/records/${id}`);
    const record = { record_id: data.id, ...data } as Projekte;
    return enrichLookupFields([record], 'projekte')[0];
  }
  static async createProjekteEntry(fields: Projekte['fields']) {
    return callApi('POST', `/apps/${APP_IDS.PROJEKTE}/records`, { fields });
  }
  static async updateProjekteEntry(id: string, fields: Partial<Projekte['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.PROJEKTE}/records/${id}`, { fields });
  }
  static async deleteProjekteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.PROJEKTE}/records/${id}`);
  }

  // --- ANGEBOTE ---
  static async getAngebote(): Promise<Angebote[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.ANGEBOTE}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Angebote[];
    return enrichLookupFields(records, 'angebote');
  }
  static async getAngeboteEntry(id: string): Promise<Angebote | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.ANGEBOTE}/records/${id}`);
    const record = { record_id: data.id, ...data } as Angebote;
    return enrichLookupFields([record], 'angebote')[0];
  }
  static async createAngeboteEntry(fields: Angebote['fields']) {
    return callApi('POST', `/apps/${APP_IDS.ANGEBOTE}/records`, { fields });
  }
  static async updateAngeboteEntry(id: string, fields: Partial<Angebote['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.ANGEBOTE}/records/${id}`, { fields });
  }
  static async deleteAngeboteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.ANGEBOTE}/records/${id}`);
  }

  // --- RECHNUNGEN ---
  static async getRechnungen(): Promise<Rechnungen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.RECHNUNGEN}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Rechnungen[];
    return enrichLookupFields(records, 'rechnungen');
  }
  static async getRechnungenEntry(id: string): Promise<Rechnungen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.RECHNUNGEN}/records/${id}`);
    const record = { record_id: data.id, ...data } as Rechnungen;
    return enrichLookupFields([record], 'rechnungen')[0];
  }
  static async createRechnungenEntry(fields: Rechnungen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.RECHNUNGEN}/records`, { fields });
  }
  static async updateRechnungenEntry(id: string, fields: Partial<Rechnungen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.RECHNUNGEN}/records/${id}`, { fields });
  }
  static async deleteRechnungenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.RECHNUNGEN}/records/${id}`);
  }

  // --- RECHNUNGSLISTE ---
  static async getRechnungsliste(): Promise<Rechnungsliste[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.RECHNUNGSLISTE}/records`);
    const records = Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    })) as Rechnungsliste[];
    return enrichLookupFields(records, 'rechnungsliste');
  }
  static async getRechnungslisteEntry(id: string): Promise<Rechnungsliste | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.RECHNUNGSLISTE}/records/${id}`);
    const record = { record_id: data.id, ...data } as Rechnungsliste;
    return enrichLookupFields([record], 'rechnungsliste')[0];
  }
  static async createRechnungslisteEntry(fields: Rechnungsliste['fields']) {
    return callApi('POST', `/apps/${APP_IDS.RECHNUNGSLISTE}/records`, { fields });
  }
  static async updateRechnungslisteEntry(id: string, fields: Partial<Rechnungsliste['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.RECHNUNGSLISTE}/records/${id}`, { fields });
  }
  static async deleteRechnungslisteEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.RECHNUNGSLISTE}/records/${id}`);
  }

}