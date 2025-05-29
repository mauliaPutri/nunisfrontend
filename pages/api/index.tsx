import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke /app saat halaman index dibuka
    router.replace("/app");
  }, [router]);

  return null;
}
