import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/auth/AuthContext";
import Head from "@/components/Head";
import Home from "@/pages/auth/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NewProperty from "@/pages/owner/NewProperty";
import MyProperties from "@/pages/owner/MyProperties";
import OwnerProperties from "@/pages/owner/OwnerProperties";
import OwnerViewings from "@/pages/owner/OwnerViewings";
import NewApplication from "@/pages/tenant/NewApplication";
import NewViewing from "@/pages/tenant/NewViewing";
import MyApplication from "@/pages/tenant/MyApplication";
import MyViewing from "@/pages/tenant/MyViewing";
import PendingProperties from "@/pages/admin/PendingProperties";
import Users from "@/pages/admin/Users";

const qc = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Head />

            {/* Main content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/createProps" element={<NewProperty />} />
                <Route path="/myProps" element={<MyProperties />} />
                <Route path="/ownerApps" element={<OwnerApplications />} />
                <Route path="/ownerViews" element={<OwnerViewings />} />
                <Route path="/submitApps" element={<NewApplication />} />
                <Route path="/requestViews" element={<NewViewing />} />
                <Route path="/tenantApps" element={<MyApplications />} />
                <Route path="/tenantViews" element={<MyViewing />} />
                <Route path="/pendingProps" element={<PendingProperties />} />
                <Route path="/searchUsers" element={<Users />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

