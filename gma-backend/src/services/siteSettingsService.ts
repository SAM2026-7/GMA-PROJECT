import { query } from '../db/index';

export const DEFAULT_SITE_SETTINGS = {
  site_name: 'GMA City Complex',
  hero_title: 'Welcome to GMA City Complex',
  hero_description: 'A place of worship, counselling, healing and prayer where every soul finds hope and restoration.',
  about_subtitle: 'GMA City Complex is a sanctuary dedicated to nurturing faith and restoring lives.',
  mission_title: 'Our Mission',
  mission_text: 'To reach out with love, strengthen families and walk with every believer on their spiritual journey.',
  vision_title: 'Our Vision',
  vision_text: 'To build a vibrant community where healing, prayer and godly counsel meet real everyday needs.',
  programs_subtitle: 'Choose a program and book a session with us.',
  counselling_description: 'Confidential guidance for marriages, career, family and personal growth.',
  healing_description: 'Spiritual and emotional healing through faith, prayer and the Word.',
  prayer_description: 'Intense times of prayer and intercession for your requests and the city.',
  sunday_label: 'Sunday Service',
  sunday_day: 'Sunday',
  sunday_time: '10:00 AM',
  midweek_label: 'Midweek Service',
  midweek_day: 'Thursday',
  midweek_time: '5:30 PM',
  giving_subtitle: 'Support the work of GMA City Complex through your generous giving.',
  giving_bank: 'Ecobank',
  giving_account: '4331097600',
  contact_phone: '08169761695',
  contact_description: 'Our lines are open during working hours.',
  footer_text: 'GMA City Complex. All rights reserved.',
} as const;

export type SiteSettingKey = keyof typeof DEFAULT_SITE_SETTINGS;

async function ensureSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
    const existing = await query('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key]);
    if (existing.length === 0) {
      await query(
        'INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)',
        [key, value, new Date().toISOString()]
      );
    }
  }
}

export async function getSiteSettings() {
  await ensureSettingsTable();
  const rows = await query('SELECT setting_key, setting_value FROM site_settings');
  const settings: Record<string, string> = { ...DEFAULT_SITE_SETTINGS };

  for (const row of rows as { setting_key: string; setting_value: string }[]) {
    settings[row.setting_key] = row.setting_value;
  }

  return settings;
}

export async function updateSiteSettings(updates: Partial<Record<SiteSettingKey, string>>) {
  await ensureSettingsTable();
  const updatedAt = new Date().toISOString();

  for (const [key, value] of Object.entries(updates)) {
    const existing = await query('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key]);
    if (existing.length > 0) {
      await query(
        'UPDATE site_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?',
        [value, updatedAt, key]
      );
    } else {
      await query(
        'INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)',
        [key, value, updatedAt]
      );
    }
  }

  return getSiteSettings();
}
