"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Mon",
    uploads: 132,
    processed: 121,
  },
  {
    name: "Tue",
    uploads: 187,
    processed: 178,
  },
  {
    name: "Wed",
    uploads: 155,
    processed: 149,
  },
  {
    name: "Thu",
    uploads: 194,
    processed: 182,
  },
  {
    name: "Fri",
    uploads: 246,
    processed: 223,
  },
  {
    name: "Sat",
    uploads: 78,
    processed: 65,
  },
  {
    name: "Sun",
    uploads: 45,
    processed: 42,
  },
]

export function Overview() {
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

