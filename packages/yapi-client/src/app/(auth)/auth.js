import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth from "next-auth"

export const authOptions = {
  // Configure one or more authentication providers
  // pages: {
  //     signIn: '/login'
  // },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        userName: { label: "用户名", type: "text", placeholder: "用户名" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        console.log('------credentials -----', credentials)
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/web/login`, {
        //     method: 'POST',
        //     body: JSON.stringify(credentials),
        //     headers: { "Content-Type": "application/json" }
        // })
        // const resData = await res.json()
        // console.log('login res user = ', resData)
        //
        // // If no error and we have user data, return it
        // if (res.ok && resData && resData.status === 0) {
        //     return resData.data
        // }
        // // Return null if user data could not be retrieved
        // return null
        const user = { id: "42", name: "justin", password: "123456", role: "manager" }
        if (credentials?.userName === user.name && credentials?.password === user.password) {
          return user
        } else {
          return null
        }
      }
    })
  ],
  callbacks: {
    // Ref: https://authjs.dev/guides/basics/role-based-access-control#persisting-the-role
    // async jwt({token, user}) {
    //     console.log('jwt user=', user)
    //     // if (user) token.role = user.role
    //     return token
    // },
    // If you want to use the role in client components
    async session({ session, user, token }) {
      //todo:如何把userId传递到session中，因为后续接口需要
      console.log('session=', session)
      console.log('user=', user)
      console.log('token=', token)
      session.accessToken = token
      return session
    },
  }
}
export const {
  handlers: { GET, POST },
  auth,
} = NextAuth(authOptions)
