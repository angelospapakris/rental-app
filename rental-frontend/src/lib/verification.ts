/** -------------------- error helpers -------------------- **/
export const looksLikeUnverified = (e: any) => {
  const msg = String(e?.response?.data?.message ?? e?.message ?? "");
  const status = Number(e?.response?.status ?? e?.status ?? e?.code ?? 0);
  // server που πετάει 400/403/500 με μήνυμα "verify"
  return /must\s*be\s*verified/i.test(msg) || /verify/i.test(msg) || [400, 403, 500].includes(status);
};

export const looksAlreadyExists = (e: any) => {
  const status = Number(e?.response?.status ?? e?.status ?? e?.code ?? 0);
  const msg = String(e?.response?.data?.message ?? e?.message ?? "");
  const code = String(e?.response?.data?.error ?? "");
  return status === 409 || /already[_\s-]?exists|duplicate|conflict/i.test(msg) || /already[_\s-]?exists|duplicate|conflict/i.test(code);
};

/** -------------------- blocked (unverified) -------------------- **/
export const storageKeyForUser = (usernameOrEmail?: string | null) =>
  usernameOrEmail ? `blocked:${usernameOrEmail}` : null;

export const getBlockedForUser = (usernameOrEmail?: string | null) => {
  const k = storageKeyForUser(usernameOrEmail);
  return k ? localStorage.getItem(k) === "true" : false;
};

export const setBlockedForUser = (usernameOrEmail?: string | null, val?: boolean) => {
  const k = storageKeyForUser(usernameOrEmail);
  if (k) localStorage.setItem(k, String(!!val));
};

export const clearBlockedForUser = (usernameOrEmail?: string | null) => {
  const k = storageKeyForUser(usernameOrEmail);
  if (k) localStorage.removeItem(k);
};

/** -------------------- local "already applied/viewing" -------------------- **/
export const appliedKey = (userId?: string | null, propertyId?: string | number) =>
  userId && propertyId != null ? `applied:${userId}:${propertyId}` : null;

export const markAppliedLocal = (userId?: string | null, propertyId?: string | number) => {
  const k = appliedKey(userId, propertyId);
  if (k) localStorage.setItem(k, "true");
};

export const hasAppliedLocal = (userId?: string | null, propertyId?: string | number) => {
  const k = appliedKey(userId, propertyId);
  return k ? localStorage.getItem(k) === "true" : false;
};

export const viewKey = (userId?: string | null, propertyId?: string | number) =>
  userId && propertyId != null ? `viewreq:${userId}:${propertyId}` : null;

export const markViewingLocal = (userId?: string | null, propertyId?: string | number) => {
  const k = viewKey(userId, propertyId);
  if (k) localStorage.setItem(k, "true");
};

export const hasViewingLocal = (userId?: string | null, propertyId?: string | number) => {
  const k = viewKey(userId, propertyId);
  return k ? localStorage.getItem(k) === "true" : false;
};
