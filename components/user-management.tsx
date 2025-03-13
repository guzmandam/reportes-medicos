"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Key, Lock, MoreHorizontal, Search, Shield, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"

const users = [
  {
    id: "U-12345",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@example.com",
    department: "Cardiology",
    role: "Doctor",
    status: "Active",
    lastActive: "Today, 2:30 PM",
    permissions: ["View Records", "Edit Records", "Upload Files"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SC",
  },
  {
    id: "U-67890",
    name: "Dr. Michael Brown",
    email: "michael.brown@example.com",
    department: "Neurology",
    role: "Doctor",
    status: "Active",
    lastActive: "Today, 10:15 AM",
    permissions: ["View Records", "Edit Records", "Upload Files"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MB",
  },
  {
    id: "U-24680",
    name: "Jennifer Lee",
    email: "jennifer.lee@example.com",
    department: "Administration",
    role: "Admin",
    status: "Active",
    lastActive: "Today, 9:45 AM",
    permissions: ["View Records", "Edit Records", "Upload Files", "Manage Users"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JL",
  },
  {
    id: "U-13579",
    name: "David Wilson",
    email: "david.wilson@example.com",
    department: "Oncology",
    role: "Nurse",
    status: "Inactive",
    lastActive: "Yesterday, 4:20 PM",
    permissions: ["View Records"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "DW",
  },
  {
    id: "U-97531",
    name: "Lisa Garcia",
    email: "lisa.garcia@example.com",
    department: "Pediatrics",
    role: "Doctor",
    status: "Active",
    lastActive: "Today, 1:05 PM",
    permissions: ["View Records", "Edit Records", "Upload Files"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "LG",
  },
  {
    id: "U-86420",
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    department: "Radiology",
    role: "Technician",
    status: "Active",
    lastActive: "Yesterday, 3:30 PM",
    permissions: ["View Records", "Upload Files"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RT",
  },
  {
    id: "U-97532",
    name: "Emily Martinez",
    email: "emily.martinez@example.com",
    department: "Administration",
    role: "IT Support",
    status: "Active",
    lastActive: "Today, 11:45 AM",
    permissions: ["View Records", "Manage Users", "System Admin"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "EM",
  },
  {
    id: "U-86421",
    name: "James Johnson",
    email: "james.johnson@example.com",
    department: "General Practice",
    role: "Doctor",
    status: "Active",
    lastActive: "Today, 9:15 AM",
    permissions: ["View Records", "Edit Records", "Upload Files"],
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JJ",
  },
]

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, department, or role..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.lastActive}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.slice(0, 2).map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                    {user.permissions.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.permissions.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit User</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Manage Permissions</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="mr-2 h-4 w-4" />
                        <span>Reset Password</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        {user.status === "Active" ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Disable Account</span>
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Enable Account</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete User</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Pagination />
      </div>
    </div>
  )
}

