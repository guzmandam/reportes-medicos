'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

const analyticsData = [
  { month: 'Jan', patients: 65, files: 240 },
  { month: 'Feb', patients: 78, files: 312 },
  { month: 'Mar', patients: 92, files: 368 },
  { month: 'Apr', patients: 85, files: 340 },
  { month: 'May', patients: 102, files: 408 },
  { month: 'Jun', patients: 120, files: 480 },
]

const dailyActivity = [
  { day: 'Mon', uploads: 45, downloads: 32 },
  { day: 'Tue', uploads: 52, downloads: 38 },
  { day: 'Wed', uploads: 48, downloads: 41 },
  { day: 'Thu', uploads: 61, downloads: 45 },
  { day: 'Fri', uploads: 55, downloads: 36 },
]

export default function Charts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Patient Growth</CardTitle>
          <CardDescription>Monthly patient registration trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="#4f46e5" name="New Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Processing</CardTitle>
          <CardDescription>Monthly file processing volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="files" 
                  stroke="#2563eb" 
                  name="Processed Files"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>File uploads and downloads this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="uploads" fill="#16a34a" name="Uploads" />
                <Bar dataKey="downloads" fill="#ca8a04" name="Downloads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 