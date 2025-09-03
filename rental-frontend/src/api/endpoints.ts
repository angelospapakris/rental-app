export const ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  properties: {
    publicProps: "/api/properties",                  // GET: public (approved only)
    createProps: "/api/properties",                  // POST: owner create (PENDING)
    myProps: "/api/properties/my",                   // GET: owner
    updateProps: (id: number | string) => `/api/properties/${id}`, // PUT
    pending: "/api/properties/pending",         // GET: admin
    approve: (id: number | string) => `/api/properties/${id}/approve`, // POST
    reject: (id: number | string) => `/api/properties/${id}/reject`,   // POST
  },
  viewings: {
    requestViews: "/api/viewings",                   // POST
    ownerViews: "/api/viewings/owner",           // GET
    tenantViews: "/api/viewings/my",                     // GET
    confirm: (id: number | string) => `/api/viewings/${id}/confirm`,   // POST
    decline: (id: number | string) => `/api/viewings/${id}/decline`,   // POST
    complete: (id: number | string) => `/api/viewings/${id}/complete`, // POST
  },
  applications: {
    submitApps: "/api/applications",                // POST
    ownerApps: "/api/applications/owner",       // GET
    tenantApps: "/api/applications/my",                 // GET
    approve: (id: number | string) => `/api/applications/${id}/approve`, // POST
    reject: (id: number | string) => `/api/applications/${id}/reject`,   // POST
  },
  adminUsers: {
    search: "/api/users",                       // GET
    get: (id: number | string) => `/api/users/${id}`, // GET
    verify: (id: number | string) => `/api/users/${id}/verify`, // POST
    assignRole: (id: number | string, role: string) => `/api/users/${id}/roles/${role}`, // POST
    removeRole: (id: number | string, role: string) => `/api/users/${id}/roles/${role}`, // DELETE
    deactivate: (id: number | string) => `/api/users/${id}/deactivate`, // POST
    activate: (id: number | string) => `/api/users/${id}/activate`,     // POST
  },
} as const;