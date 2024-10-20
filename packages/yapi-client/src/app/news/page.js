import { auth } from "@/app/(auth)/auth";
import UserDetail from "@/components/user/userDetail";

export default async function Home() {
  const session = await auth()
  return (
    <main className="p-24">
      news page
      <UserDetail/>
    </main>
  );
}
