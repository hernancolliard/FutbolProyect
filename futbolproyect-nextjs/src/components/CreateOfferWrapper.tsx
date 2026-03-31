"use client";

import React, { useEffect, useState } from "react";
import CreateOfferForm from "./CreateOfferForm";

interface CreateOfferProps {
  onOfferCreated?: () => void;
  onClose?: () => void;
}

export default function CreateOffer(props: CreateOfferProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Solo renderizar después de montar en el cliente para evitar mismatch SSR/cliente
  if (!isMounted) {
    return null;
  }

  return <CreateOfferForm {...props} />;
}
