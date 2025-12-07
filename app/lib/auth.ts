import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { organization } from "better-auth/plugins"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  plugins: [
    nextCookies(),
    organization({
      // 既存のTenantモデルをorganizationにマッピング
      schema: {
        organization: {
          modelName: "tenant",
          fields: {
            name: "name",
            slug: "slug",
          },
        },
        member: {
          modelName: "tenantMember",
          fields: {
            role: "role",
            organizationId: "tenantId",
          },
        },
      },
      // ロール定義
      roles: {
        owner: {
          name: "OWNER",
          permissions: ["create", "read", "update", "delete", "invite", "remove"],
        },
        admin: {
          name: "ADMIN",
          permissions: ["read", "update", "invite"],
        },
        member: {
          name: "MEMBER",
          permissions: ["read"],
        },
      },
      // 招待メール送信（後で実装）
      async sendInvitationEmail(data) {
        // TODO: メール送信ロジック
        console.log('Invitation email:', {
          email: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
        })
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      hash: async (password) => {
        return await bcrypt.hash(password, 10)
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash)
      }
    },
    // デフォルトのリダイレクト先
    sendResetPassword: async ({ user, url }) => {
      // TODO: パスワードリセットメール送信
      console.log('Password reset URL:', url)
    },
  },
  // 認証後のリダイレクト設定
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session every day)
  },
  secret: process.env.BETTER_AUTH_SECRET || "your-secret-key-change-this-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL || "http://localhost:3000"
  ]
})

export type Session = typeof auth.$Infer.Session
