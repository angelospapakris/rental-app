export const ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
  },
  properties: {
    public: "/api/properties",                  // GET: public (approved only)
    create: "/api/properties",                  // POST: owner create (PENDING)
    my: "/api/properties/my",                   // GET: owner
    update: (id: number | string) => `/api/properties/${id}`, // PUT
    pending: "/api/properties/pending",         // GET: admin
    approve: (id: number | string) => `/api/properties/${id}/approve`, // POST
    reject: (id: number | string) => `/api/properties/${id}/reject`,   // POST
  },
  viewings: {
    request: "/api/viewings",                   // POST
    ownerList: "/api/viewings/owner",           // GET
    my: "/api/viewings/my",                     // GET
    confirm: (id: number | string) => `/api/viewings/${id}/confirm`,   // POST
    decline: (id: number | string) => `/api/viewings/${id}/decline`,   // POST
    complete: (id: number | string) => `/api/viewings/${id}/complete`, // POST
  },
  applications: {
    submit: "/api/applications",                // POST
    ownerList: "/api/applications/owner",       // GET
    my: "/api/applications/my",                 // GET
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
