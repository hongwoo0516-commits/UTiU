import "server-only";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { allowAuthAttempt } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { User } from "@/models/User";

class TooManyAttempts extends CredentialsSignin { code = "too_many_attempts"; }
const dummyHash = bcrypt.hashSync("utiu-dummy-password", 12);

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [Credentials({
    credentials: { email: { type: "email" }, password: { type: "password" } },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;
      await connectDB();
      if (!(await allowAuthAttempt(email, "login"))) throw new TooManyAttempts();
      const user = await User.findOne({ email }).select("+passwordHash");
      const valid = await bcrypt.compare(password, user?.passwordHash || dummyHash);
      if (!user || !valid) return null;
      return { id: String(user._id), name: user.name, email: user.email };
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) token.id = user.id; return token; },
    session({ session, token }) { session.user.id = String(token.id || token.sub || ""); return session; },
  },
  logger: {
    error(error) { console.error("Authentication error:", error.name); },
  },
});
