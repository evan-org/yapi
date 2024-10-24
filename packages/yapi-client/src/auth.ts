import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize(c) {
      console.log("credentials c:", c);
      if (c.password !== "password") {
        return null
      }
      return {
        id: "test",
        name: "Test User",
        email: "test@example.com",
      }
    },
  }),
  GitHub,
  Google,
  Twitter,
]
export const providerMap = providers.map((provider) => {
  if (typeof provider === "function") {
    const providerData = provider()
    return { id: providerData.id, name: providerData.name }
  } else {
    return { id: provider.id, name: provider.name }
  }
}).filter((provider) => provider.id !== "credentials");
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  // callbacks: {
  //   async session({session, user, token}) {
  //     // todo:如何把userId传递到session中，因为后续接口需要
  //     console.log("session=", session)
  //     console.log("user=", user)
  //     console.log("token=", token)
  //     session.accessToken = token
  //     return session
  //   },
  // },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.AUTH_SECRET,
})
