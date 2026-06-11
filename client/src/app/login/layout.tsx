import { Suspense } from "react";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-neutral-500">
      <p className="text-sm tracking-wide">加载中…</p>
    </div>
  );
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Suspense fallback={<LoginFallback />}>{children}</Suspense>
    </div>
  );
}
