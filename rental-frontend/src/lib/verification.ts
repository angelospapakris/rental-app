export const looksLikeUnverified = (e: any) => {
  const msg = String(e?.response?.data?.message ?? e?.message ?? "");
  const status = Number(e?.response?.status ?? e?.status ?? e?.code ?? 0);
  // πιάσε 400/403/500 με μηνύματα τύπου "Tenant must be verified"
  return /must\s*be\s*verified/i.test(msg) || /verify/i.test(msg) || [400, 403, 500].includes(status);
};

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
