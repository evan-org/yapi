import { auth } from "@/auth.ts";
import UserDetail from "@/components/user/userDetail";

export default async function Home() {
  const session = await auth()
  return (
    <main className="p-24">
      news page {JSON.stringify(session)}
      <UserDetail/>
    </main>
  );
}
