import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { ConfettiEffect } from "@/components/ConfettiEffect";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <ConfettiEffect duration={5000} />
      
      <Card className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Thank You!</h1>
            <p className="text-muted-foreground text-lg">
              Your submission has been received successfully. We'll get back to you shortly.
            </p>
          </div>

          <Button asChild className="w-full" size="lg">
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
