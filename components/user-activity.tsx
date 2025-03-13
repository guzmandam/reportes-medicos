"use client"
import { CheckCircle, FileUp, UserPlus } from "lucide-react"

const activities = [
  {
    id: "1",
    user: "Dr. Sarah Chen",
    action: "uploaded",
    target: "5 patient records",
    time: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SC",
    icon: <FileUp className="h-4 w-4" />,
    iconClassName: "bg-blue-100 text-blue-600",
  },
  {
    id: "2",
    user: "Admin John Doe",
    action: "added",
    target: "new user permissions",
    time: "4 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JD",
    icon: <UserPlus className="h-4 w-4" />,
    iconClassName: "bg-green-100 text-green-600",
  },
  {
    id: "3",
    user: "Dr. Emily Jones",
    action: "completed",
    target: "patient data review",
    time: "Yesterday",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "EJ",
    icon: <CheckCircle className="h-4 w-4" />,
    iconClassName: "bg-purple-100 text-purple-600",
  },
]

export function UserActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${activity.iconClassName}`}>
            {activity.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{activity.user}</span>
              <span className="text-sm text-muted-foreground">{activity.action}</span>
              <span className="font-medium">{activity.target}</span>
            </div>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

