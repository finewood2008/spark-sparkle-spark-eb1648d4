/** Shared user preferences – used by account page & AI generation */

import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface UserPreferences {
  defaultPlatform: 'xiaohongshu' | 'wechat' | 'douyin';
  writingStyle: string;
  writingTone: string;
  signature: string;
}

export const defaultPrefs: UserPreferences = {
  defaultPlatform: 'xiaohongshu',
  writingStyle: '专业严谨',
  writingTone: '友好亲切',
  signature: '',
};

const STORAGE_KEY = 'spark-user-prefs';

/** Load from localStorage (instant, offline-friendly) */
export function loadUserPrefs(): UserPreferences {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? { ...defaultPrefs, ...JSON.parse(s) } : defaultPrefs;
  } catch {
    return defaultPrefs;
  }
}

/** Save to localStorage */
function saveLocal(p: UserPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/** Save to both localStorage and database (if logged in) */
export async function saveUserPrefs(p: UserPreferences) {
  saveLocal(p);
  const { user, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || !user?.id) return;

  const row = {
    user_id: user.id,
    default_platform: p.defaultPlatform,
    writing_style: p.writingStyle,
    writing_tone: p.writingTone,
    signature: p.signature,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from('user_preferences').update(row).eq('id', existing.id);
  } else {
    await supabase.from('user_preferences').insert(row);
  }
}

/** Load from database and merge into localStorage. Returns the merged prefs. */
export async function syncPrefsFromCloud(): Promise<UserPreferences> {
  const { user, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated || !user?.id) return loadUserPrefs();

  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (data) {
    const prefs: UserPreferences = {
      defaultPlatform: (data.default_platform as UserPreferences['defaultPlatform']) || defaultPrefs.defaultPlatform,
      writingStyle: data.writing_style || defaultPrefs.writingStyle,
      writingTone: data.writing_tone || defaultPrefs.writingTone,
      signature: data.signature || defaultPrefs.signature,
    };
    saveLocal(prefs);
    return prefs;
  }
  return loadUserPrefs();
}

/** Build a context string for AI prompts */
export function getUserPrefsContext(): string {
  const p = loadUserPrefs();
  const parts: string[] = [];
  parts.push('【用户写作偏好】');
  parts.push(`默认平台: ${platformLabel(p.defaultPlatform)}`);
  parts.push(`写作风格: ${p.writingStyle}`);
  parts.push(`语气偏好: ${p.writingTone}`);
  if (p.signature) parts.push(`个性签名: ${p.signature}`);
  return parts.join('\n');
}

export function platformLabel(v: string) {
  const map: Record<string, string> = { xiaohongshu: '小红书', wechat: '公众号', douyin: '抖音' };
  return map[v] || v;
}
