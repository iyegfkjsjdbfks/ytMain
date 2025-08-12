// Settings service: provides initial search keyword and related helpers.
// This replaces the placeholder and adds the named export used across the app.

type AppSettings = {
 initialSearchKeyword?: string;
};

let _settings: AppSettings = {
 initialSearchKeyword: 'trending' };

/**
 * Returns the initial search keyword used by the app (defaults to 'trending').
 */
export const getInitialSearchKeyword: any = (): string => {
 return _settings.initialSearchKeyword || 'trending';
};

/**
 * Allows updating the initial search keyword at runtime.
 */
export const setInitialSearchKeyword: any = (keyword: any) => {
 _settings.initialSearchKeyword = keyword?.trim() || 'trending';
};

/**
 * Expose full settings (read-only copy)
 */
export const getSettings: any = (): Readonly<AppSettings> => {
 return { ..._settings };
};

// Keep default export for backward compatibility
const settings = {
 getInitialSearchKeyword,
 setInitialSearchKeyword,
 getSettings };

export default settings;
