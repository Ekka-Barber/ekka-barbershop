/**
 * Validate and safely access nested properties
 * @param obj The object to access
 * @param path Path to the property
 * @param defaultValue Default value if property doesn't exist
 */
export const safeGet = <T, O extends Record<string, unknown>>(obj: O, path: string, defaultValue: T): T => {
  try {
    const travel = (regexp: RegExp) =>
      String.prototype.split
        .call(path, regexp)
        .filter(Boolean)
        .reduce((res, key) => (res !== null && res !== undefined ? res[key as keyof typeof res] : res), obj as unknown);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === null ? defaultValue : result as T;
  } catch (_error) {
    return defaultValue;
  }
};