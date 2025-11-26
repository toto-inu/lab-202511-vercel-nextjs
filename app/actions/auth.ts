'use server'

import { signIn, signOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  await signIn('google', { redirectTo: '/' })
}

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/',
    })
  } catch (error) {
    // NextAuth のリダイレクトエラーは再スロー
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error
    }
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }
}

export async function signUpWithCredentials(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!name || !email || !password) {
    return { error: '全ての項目を入力してください' }
  }

  if (password !== confirmPassword) {
    return { error: 'パスワードが一致しません' }
  }

  if (password.length < 8) {
    return { error: 'パスワードは8文字以上で入力してください' }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: 'このメールアドレスは既に登録されています' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  // 登録後に自動ログイン
  await signIn('credentials', {
    email,
    password,
    redirectTo: '/',
  })
}

export async function signOutAction() {
  await signOut({ redirectTo: '/auth/signin' })
}
