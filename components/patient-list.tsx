"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, FileText, MoreHorizontal, Search, UserCog } from "lucide-react"
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

const patients = [
  {
    id: "P-12345",
    name: "Sarah Chen",
    gender: "Female",
    dateOfBirth: "12/05/1985",
    phoneNumber: "(555) 123-4567",
    email: "sarah.chen@example.com",
    address: "123 Main St, Anytown, CA 94538",
    recordCount: 8,
    lastVisit: "Apr 15, 2023",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "SC",
  },
  {
    id: "P-67890",
    name: "Michael Brown",
    gender: "Male",
    dateOfBirth: "08/17/1973",
    phoneNumber: "(555) 234-5678",
    email: "michael.brown@example.com",
    address: "456 Oak Ave, Somewhere, CA 94539",
    recordCount: 5,
    lastVisit: "Apr 10, 2023",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "MB",
  },
  {
    id: "P-24680",
    name: "Jennifer Lee",
    gender: "Female",
    dateOfBirth: "05/22/1990",
    phoneNumber: "(555) 345-6789",
    email: "jennifer.lee@example.com",
    address: "789 Elm Blvd, Nowhere, CA 94540",
    recordCount: 3,
    lastVisit: "Apr 5, 2023",
    status: "Inactive",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JL",
  },
  {
    id: "P-13579",
    name: "David Wilson",
    gender: "Male",
    dateOfBirth: "10/30/1965",
    phoneNumber: "(555) 456-7890",
    email: "david.wilson@example.com",
    address: "321 Pine St, Elsewhere, CA 94541",
    recordCount: 12,
    lastVisit: "Apr 2, 2023",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "DW",
  },
  {
    id: "P-97531",
    name: "Lisa Garcia",
    gender: "Female",
    dateOfBirth: "03/15/1982",
    phoneNumber: "(555) 567-8901",
    email: "lisa.garcia@example.com",
    address: "654 Maple Dr, Anyplace, CA 94542",
    recordCount: 6,
    lastVisit: "Mar 28, 2023",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "LG",
  },
  {
    id: "P-86420",
    name: "Robert Taylor",
    gender: "Male",
    dateOfBirth: "07/08/1978",
    phoneNumber: "(555) 678-9012",
    email: "robert.taylor@example.com",
    address: "987 Cedar Ln, Somewhere, CA 94543",
    recordCount: 4,
    lastVisit: "Mar 25, 2023",
    status: "Inactive",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "RT",
  },
  {
    id: "P-97532",
    name: "Emily Martinez",
    gender: "Female",
    dateOfBirth: "11/12/1992",
    phoneNumber: "(555) 789-0123",
    email: "emily.martinez@example.com",
    address: "135 Birch Ct, Nowhere, CA 94544",
    recordCount: 2,
    lastVisit: "Mar 20, 2023",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "EM",
  },
  {
    id: "P-86421",
    name: "James Johnson",
    gender: "Male",
    dateOfBirth: "02/28/1970",
    phoneNumber: "(555) 890-1234",
    email: "james.johnson@example.com",
    address: "246 Walnut Way, Elsewhere, CA 94545",
    recordCount: 9,
    lastVisit: "Mar 18, 2023",
    status: "Active",
    avatar: "/placeholder.svg?height=40&width=40",
    initials: "JJ",
  },
]

export function PatientList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, ID, or email..."
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
              <TableHead>Patient</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback>{patient.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">{patient.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.dateOfBirth}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{patient.phoneNumber}</div>
                    <div className="text-xs text-muted-foreground">{patient.email}</div>
                  </div>
                </TableCell>
                <TableCell>{patient.recordCount}</TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
                <TableCell>
                  <Badge variant={patient.status === "Active" ? "default" : "secondary"}>{patient.status}</Badge>
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
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>View Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Information</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>View Records</span>
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

