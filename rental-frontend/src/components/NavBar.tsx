import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export default function NavBar() {
  const { user, logout, hasRole } = useAuth();

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-4 gap-4">
        <Link to="/" className="font-semibold text-xl">Rental System</Link>
        <nav className="flex items-center gap-3">
          <Link to="/">Ακίνητα</Link>

          {hasRole("OWNER") && (
            <>
              <Link to="/owner/properties">Τα ακίνητά μου</Link>
              <Link to="/owner/applications">Αιτήσεις</Link>
              <Link to="/owner/viewings">Προβολές</Link>
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
