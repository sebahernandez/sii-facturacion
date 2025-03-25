"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LayoutRegister from "../register/layout";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <LayoutRegister>
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-semibold text-center">
              Crear una cuenta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </LayoutRegister>
  );
}
