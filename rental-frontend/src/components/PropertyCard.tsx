// src/components/PropertyCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Props = {
  property: any;

  showApply?: boolean;
  showViewing?: boolean;

  // Disabled + μήνυμα
  applyDisabled?: boolean;
  applyReason?: string;
  viewingDisabled?: boolean;
  viewingReason?: string;
};

export default function PropertyCard({
  property,
  showApply = false,          // default: κρυφό (για να το ανοίγεις ρητά από Home)
  showViewing = false,
  applyDisabled,
  applyReason,
  viewingDisabled,
  viewingReason,
}: Props) {
  return (
    <Card className="rounded-2xl w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span className="text-lg font-semibold">
            {property.title || property.name || "Ακίνητο"}
          </span>
          <span className="text-muted-foreground text-sm">
            {property.city ?? property.location}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {property.description && (
          <p className="text-sm leading-relaxed">{property.description}</p>
        )}
        {property.price && (
          <p className="font-semibold text-base">{property.price}€</p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Αίτηση ενοικίασης (TENANT μόνο) */}
          {showApply && (
            applyDisabled ? (
              <div className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto" disabled title={applyReason || "Μη διαθέσιμο"} aria-disabled>
                  Αίτηση ενοικίασης
                </Button>
                {applyReason && (
                  <p className="mt-1 text-xs text-amber-700">{applyReason}</p>
                )}
              </div>
            ) : (
              <Button asChild className="w-full sm:w-auto">
                <Link to={`/submitApps?propertyId=${property.id}`}>Αίτηση ενοικίασης</Link>
              </Button>
            )
          )}

          {/* Αίτημα προβολής (TENANT μόνο) */}
          {showViewing && (
            viewingDisabled ? (
              <div className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto" variant="outline" disabled title={viewingReason || "Μη διαθέσιμο"} aria-disabled>
                  Αίτημα προβολής
                </Button>
                {viewingReason && (
                  <p className="mt-1 text-xs text-amber-700">{viewingReason}</p>
                )}
              </div>
            ) : (
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link to={`/requestViews?propertyId=${property.id}`}>Αίτημα προβολής</Link>
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
