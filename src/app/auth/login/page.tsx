"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LayoutLogin from "./layout";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <LayoutLogin>
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-semibold text-center">
              Iniciar Sesión
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </LayoutLogin>
  );
}
