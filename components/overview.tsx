"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewProps {
  data?: Array<{
    name: string
    uploads: number
    processed: number
  }>
}

// Fallback data for when no data is provided
const fallbackData = [
  {
    name: "Mon",
    uploads: 0,
    processed: 0,
  },
  {
    name: "Tue",
    uploads: 0,
    processed: 0,
  },
  {
    name: "Wed",
    uploads: 0,
    processed: 0,
  },
  {
    name: "Thu",
    uploads: 0,
    processed: 0,
  },
  {
    name: "Fri",
    uploads: 0,
    processed: 0,
  },
  {
    name: "Sat",
    uploads: 0,
    processed: 0,
  },
  {
    name: "Sun",
    uploads: 0,
    processed: 0,
  },
]

export function Overview({ data = fallbackData }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="uploads" fill="#adfa1d" radius={[4, 4, 0, 0]} className="fill-primary" />
        <Bar dataKey="processed" fill="#b4a9ff" radius={[4, 4, 0, 0]} className="fill-primary/60" />
      </BarChart>
    </ResponsiveContainer>
  )
}

