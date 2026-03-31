"use client";

import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

interface GoogleLoginButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError: () => void;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // No renderizar nada hasta que el componente esté montado en el cliente
  if (!isMounted) {
    return null;
  }

  return (
    <GoogleLogin onSuccess={onSuccess} onError={onError} />
  );
}
