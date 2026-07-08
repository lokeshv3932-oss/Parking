"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isCustomerLoggedIn } from "@/lib/customerAuth";

export default function RequireCustomer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isCustomerLoggedIn()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
