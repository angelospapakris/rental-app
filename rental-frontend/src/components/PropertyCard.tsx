import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  property: any;
  onApply?: () => void;
  onRequestViewing?: () => void;
};
export default function PropertyCard({ property, onApply, onRequestViewing }: Props) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{property.title || property.name || "Ακίνητο"}</span>
          <span className="text-muted-foreground">{property.city ?? property.location}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>{property.description}</p>
        {property.price && <p className="font-semibold">{property.price} € / μήνα</p>}
        <div className="flex gap-2">
          {onApply && <Button onClick={onApply}>Αίτηση ενοικίασης</Button>}
          {onRequestViewing && <Button variant="outline" onClick={onRequestViewing}>Αίτημα προβολής</Button>}
        </div>
      </CardContent>
    </Card>
  );
}
