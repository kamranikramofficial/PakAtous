"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PartEditRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Redirect to the edit page
    router.replace(`/admin/parts/${params.id}/edit`);
  }, [params.id, router]);

  return (
    <div className="flex h-48 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
