import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <Frown className="w-16 h-16 text-gray-500 mb-4" />
      <h1 className="text-2xl font-semibold">Λυπούμαστε, δεν υπάρχει κάτι για εσένα!</h1>
      <p className="text-gray-500 mt-2">404</p>
    </div>
  );
}
