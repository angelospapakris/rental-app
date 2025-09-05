export const ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  properties: {
    publicProps: "/api/properties",                                                       // GET: public (approved only)
    createProps: "/api/properties",                                                       // POST: owner create (PENDING)
    myProps: "/api/properties/my",                                                        // GET: owner
    updateProps: (id: number | string) => `/api/properties/${id}`,                        // PUT: owner
    pending: "/api/properties/pending",                                                   // GET: admin
    approve: (id: number | string) => `/api/properties/${id}/approve`,                    // POST: admin
    reject: (id: number | string) => `/api/properties/${id}/reject`,                      // POST: admin
  },
  viewings: {
    requestViews: (propertyId: string | number) =>
          `/api/viewings?propertyId=${encodeURIComponent(propertyId)}`,                   // POST: tenant
    ownerViews: "/api/viewings/owner",                                                    // GET: owner
    tenantViews: "/api/viewings/my",                                                      // GET: tenant
    confirm: (id: number | string) => `/api/viewings/${id }/confirm`,                     // POST: owner
    decline: (id: number | string) => `/api/viewings/${id}/decline`,                      // POST: owner
    complete: (id: number | string) => `/api/viewings/${id}/complete`,                    // POST: owner
  },
  applications: {
    submitApp: (propertyId: string | number) =>
        `/api/applications?propertyId=${encodeURIComponent(propertyId)}`,                 // POST: tenant
    ownerApps: "/api/applications/owner",                                                 // GET: owner
    tenantApps: "/api/applications/my",                                                   // GET: tenant
    approve: (id: number | string) => `/api/applications/${id}/approve`,                  // POST: owner
    reject: (id: number | string) => `/api/applications/${id}/reject`,                    // POST: owner
  },
  adminUsers: {
    search: "/api/users",                                                                 // GET: admin, query: ?role=&verified=&active=
    get: (id: number | string) => `/api/users/${id}`,                                     // GET : admin
    verify: (id: number | string) => `/api/users/${id}/verify`,                           // POST: admin
    assignRole: (id: number | string, role: string) => `/api/users/${id}/roles/${role}`,  // POST: admin
    removeRole: (id: number | string, role: string) => `/api/users/${id}/roles/${role}`,  // DELETE: admin
    deactivate: (id: number | string) => `/api/users/${id}/deactivate`,                   // POST: admin
    activate: (id: number | string) => `/api/users/${id}/activate`,                       // POST: admin
  },
} as const;