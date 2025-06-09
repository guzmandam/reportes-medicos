'use client'

import { SignupForm } from '@/components/auth/signup-form'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una nueva cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            O{' '}
            <Link href="/login" className="font-medium text-black hover:text-gray-500">
              iniciar sesión en su cuenta
            </Link>
          </p>
        </div> */}
        <SignupForm />
      </div>
    </div>
  )
} 