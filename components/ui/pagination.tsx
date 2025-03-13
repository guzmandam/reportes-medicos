"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

// import { cn } from "@/lib/utils" // Not used in the updated component
// import { ButtonProps, buttonVariants } from "@/components/ui/button" // Not used in the updated component
import { Button } from "@/components/ui/button"

export function Pagination() {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Button variant="outline" size="sm">
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </Button>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
        1
      </Button>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-primary text-primary-foreground">
        2
      </Button>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
        3
      </Button>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More pages</span>
      </Button>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
        12
      </Button>
      <Button variant="outline" size="sm">
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </Button>
    </div>
  )
}

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => <ul ref={ref} className="flex flex-row items-center gap-1" {...props} />,
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(({ className, ...props }, ref) => (
  <li ref={ref} className="" {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<any, "size"> &
  React.ComponentProps<"a">

const PaginationLink = ({ className, isActive, size = "icon", ...props }: PaginationLinkProps) => (
  <a aria-current={isActive ? "page" : undefined} className="" {...props} />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to previous page" size="default" className="gap-1 pl-2.5" {...props}>
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink aria-label="Go to next page" size="default" className="gap-1 pr-2.5" {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span aria-hidden className="flex h-9 w-9 items-center justify-center" {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious }

