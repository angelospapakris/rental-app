import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function NavBar() {
  const { user, logout, hasRole } = useAuth();
  const qc = useQueryClient();

  const handleLogout = async () => {
    // ενημέρωσε όλη την app ότι έγινε logout
    window.dispatchEvent(new Event("app:logout"));
    // καθάρισε react-query cache (προαιρετικό, αλλά χρήσιμο)
    qc.clear();
    // κάνε ό,τι ήδη έκανες στο logout
    await logout();
  };

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
              <Link to="/tenantApps">Οι αιτήσεις μου</Link>
              <Link to="/tenantViews">Οι προβολές μου</Link>
            </>
          )}

          {hasRole("ADMIN") && (
            <>
              <Link to="/pendingProps">Εγκρίσεις ακινήτων</Link>
              <Link to="/searchUsers">Χρήστες</Link>
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
              <Button variant="destructive" onClick={handleLogout}>Έξοδος</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
