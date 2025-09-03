import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NavBar() {
  const { user, logout, hasRole } = useAuth();

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-3 gap-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-xl">
          <Home className="h-6 w-6" />
          Σύστημα Διαχείρισης Ακινήτων
        </Link>
        <nav className="flex items-center gap-4 flex-wrap">

          {hasRole("OWNER") && (
            <>
              <Link to="/myProps">Τα ακίνητά μου</Link>
              <Link to="/ownerApps">Αιτήσεις</Link>
              <Link to="/ownerViews">Προβολές</Link>
            </>
          )}

          {hasRole("TENANT") && (
            <>
              <Link to="/tenant/applications">Οι αιτήσεις μου</Link>
              <Link to="/tenant/viewings">Οι προβολές μου</Link>
            </>
          )}

          {hasRole("ADMIN") && (
            <>
              <Link to="/admin/pending">Εγκρίσεις</Link>
              <Link to="/admin/users">Χρήστες</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <Link to="/login"><Button variant="outline">Σύνδεση</Button></Link>
              <Link to="/register"><Button>Εγγραφή</Button></Link>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="destructive" onClick={logout}>Έξοδος</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
