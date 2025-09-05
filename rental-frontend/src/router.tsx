import { createBrowserRouter } from "react-router-dom";
import Home from "@/pages/auth/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import NewProperty from "@/pages/owner/NewProperty";
import MyProperties from "@/pages/owner/MyProperties";
import OwnerApplications from "@/pages/owner/OwnerApplications";
import OwnerViewings from "@/pages/owner/OwnerViewings";
import PendingProperties from "@/pages/admin/PendingProperties";
import Users from "@/pages/admin/Users";
import Protected from "@/auth/Protected";
import NotFound from "@/pages/NotFound";
import Head from "@/components/Head";
import NewApplication from "@/pages/tenant/NewApplication";
import NewViewing from "@/pages/tenant/NewViewing";
import MyApplications from "@/pages/tenant/MyApplications";
import MyViewings from "@/pages/tenant/MyViewings";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Head/>
      <main>{children}</main>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Shell><Home/></Shell> },
  { path: "/login", element: <Shell><Login/></Shell> },
  { path: "/register", element: <Shell><Register/></Shell> },

  { path: "/createProps", element: <Protected roles={["OWNER"]}><Shell><NewProperty/></Shell></Protected> },
  { path: "/myProps", element: <Protected roles={["OWNER"]}><Shell><MyProperties/></Shell></Protected> },
  { path: "/ownerApps", element: <Protected roles={["OWNER"]}><Shell><OwnerApplications/></Shell></Protected> },
  { path: "/ownerViews", element: <Protected roles={["OWNER"]}><Shell><OwnerViewings/></Shell></Protected> },

  { path: "/submitApps", element: <Protected roles={["TENANT"]}><Shell><NewApplication/></Shell></Protected> },
  { path: "/requestViews", element: <Protected roles={["TENANT"]}><Shell><NewViewing/></Shell></Protected> },
  { path: "/tenantViews", element: <Protected roles={["TENANT"]}><Shell><MyViewings/></Shell></Protected> },
  { path: "/tenantApps", element: <Protected roles={["TENANT"]}><Shell><MyApplications/></Shell></Protected> },

  { path: "/pendingProps", element: <Protected roles={["ADMIN"]}><Shell><PendingProperties/></Shell></Protected> },
  { path: "/searchUsers", element: <Protected roles={["ADMIN"]}><Shell><Users/></Shell></Protected> },

  { path: "*", element: <Shell><NotFound/></Shell> }
]);
