'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const Charts = dynamic(() => import('@/components/analytics/charts'), {
  ssr: false,
  loading: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Patient Growth</CardTitle>
          <CardDescription>Monthly patient registration trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>File Processing</CardTitle>
          <CardDescription>Monthly file processing volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>File uploads and downloads this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
})

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>
      <Charts />
    </div>
  )
} 