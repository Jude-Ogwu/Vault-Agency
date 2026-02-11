import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-hero mb-6">
        <Shield className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page not found</p>
      <Link to="/">
        <Button className="gradient-hero border-0 gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
