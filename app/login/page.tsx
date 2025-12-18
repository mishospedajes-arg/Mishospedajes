"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Attempting login...");
    const result = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/admin/dashboard",
      email,
      password,
    });
    console.log("Login result:", result);

    if (result?.error) {
      console.error("Login failed:", result.error);
      setError("Credenciales inválidas. Por favor, intente de nuevo.");
      toast({
        title: "Error de autenticación",
        description: "Credenciales inválidas. Por favor, intente de nuevo.",
        variant: "destructive",
      });
    } else if (result?.ok) {
      console.log("Login successful, redirecting...");
      router.push("/admin/dashboard");
      router.refresh(); // Ensure headers/cookies are re-read
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full">
              Acceder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
