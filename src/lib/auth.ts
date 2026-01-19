import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/prisma";
import { User, IUser, UserRole, UserStatus } from "@/models/User";
import { Account } from "@/models/Account";
import { Session as SessionModel } from "@/models/Session";
import { Cart } from "@/models/Cart";

// Only include Google provider if credentials are configured
const providers: NextAuthOptions["providers"] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      await dbConnect();

      const email = credentials.email as string;
      const password = credentials.password as string;

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user || !user.password) {
        throw new Error("Invalid email or password");
      }

      if (user.status === UserStatus.BLOCKED) {
        throw new Error("Your account has been blocked. Please contact support.");
      }

      if (user.status === UserStatus.PENDING_VERIFICATION) {
        throw new Error("Please verify your email before logging in");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Update last login
      await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      await dbConnect();
      // For OAuth providers, check if user is blocked
      if (account?.provider !== "credentials") {
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser?.status === UserStatus.BLOCKED) {
          return false;
        }

        // Update last login for OAuth users
        if (existingUser) {
          await User.findByIdAndUpdate(existingUser._id, { lastLoginAt: new Date() });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role as UserRole;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      // Refresh user data from database
      if (token.id) {
        await dbConnect();
        const dbUser = await User.findById(token.id).select('role status name image');

        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.image = dbUser.image;

          // Check if user is blocked
          if (dbUser.status === UserStatus.BLOCKED) {
            return null as any;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.image = token.image as string | null | undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      
      await dbConnect();
      
      // Check if this is the admin email from env
      const adminEmail = process.env.ADMIN_EMAIL;
      if (user.email === adminEmail) {
        await User.findByIdAndUpdate(user.id, { 
          role: UserRole.ADMIN, 
          status: UserStatus.ACTIVE 
        });
      }

      // Create cart for new user
      await Cart.create({ userId: user.id });
    },
  },
};

export const auth = () => getServerSession(authOptions);
