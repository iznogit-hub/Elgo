import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Discord, Google],
  pages: {
    signIn: "/guestbook", // Redirect back to guestbook to sign in
  },
  callbacks: {
    async session({ session, token }) {
      // Pass the user ID to the session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
