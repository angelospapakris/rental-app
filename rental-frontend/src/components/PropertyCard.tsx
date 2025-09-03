import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Props = {
  property: any;
};

export default function PropertyCard({ property }: Props) {
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
        <p className="text-sm leading-relaxed">{property.description}</p>
        {property.price && (
          <p className="font-semibold text-base">{property.price}€</p>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild className="w-full sm:w-auto">
            <Link to={`/submitApps?propertyId=${property.id}`}>
              Αίτηση ενοικίασης
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={`/requestViews?propertyId=${property.id}`}>
              Αίτημα προβολής
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
