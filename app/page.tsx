'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentUploads } from "@/components/recent-uploads"
import { UserActivity } from "@/components/user-activity"
import { Button } from "@/components/ui/button"
import { ArrowRight, File, FileText, Upload, Users, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { dashboardApi, DashboardStats } from "@/lib/dashboard-api"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const dashboardStats = await dashboardApi.getStats()
        setStats(dashboardStats)
      } catch (err: any) {
        console.error('Error fetching dashboard stats:', err)
        setError(err?.response?.data?.detail || err?.message || 'Error desconocido')
        toast({
          title: "Error al cargar estadísticas",
          description: "No se pudieron cargar las estadísticas del dashboard. Mostrando datos básicos.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  const formatChange = (change: number): string => {
    if (change === 0) return "Sin cambios"
    const sign = change > 0 ? "+" : ""
    return `${sign}${change} desde el mes pasado`
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <div className="flex gap-2">
              <Button variant="outline">Exportar Datos</Button>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Archivos
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Cargas Recientes</CardTitle>
                <CardDescription>Cargando...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error && !stats) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Panel de Control</h1>
            <div className="flex gap-2">
              <Button variant="outline">Exportar Datos</Button>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Archivos
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Error al cargar estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No se pudieron cargar las estadísticas del dashboard. Por favor, revisa tu conexión e intenta nuevamente.
              </p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panel de Control</h1>
          <div className="flex gap-2">
            <Button variant="outline">Exportar Datos</Button>
            <Button asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Subir Archivos
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total de Pacientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_patients.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.changes.patients ? formatChange(stats.changes.patients) : "Sin datos"}
              </p>
            </CardContent>
          </Card>

          {/* Archivos Procesados */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Archivos Procesados</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_files.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.changes.files ? formatChange(stats.changes.files) : "Sin datos"}
              </p>
            </CardContent>
          </Card>

          {/* Cargas Pendientes - Solo se muestra si hay datos */}
          {stats && stats.pending_uploads > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cargas Pendientes</CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending_uploads.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.changes.pending ? formatChange(stats.changes.pending) : "Sin datos"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Usuarios Activos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.active_users.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.changes.users ? formatChange(stats.changes.users) : "Sin datos"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Actividad Semanal - Solo se muestra si hay datos */}
          {stats && stats.weekly_activity && stats.weekly_activity.length > 0 && (
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Actividad Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <Overview data={stats.weekly_activity} />
              </CardContent>
            </Card>
          )}

          {/* Cargas Recientes - Solo se muestra si hay datos */}
          {stats && stats.recent_uploads && stats.recent_uploads.length > 0 && (
            <Card className={`col-span-3 ${(!stats.weekly_activity || stats.weekly_activity.length === 0) ? 'md:col-span-2 lg:col-span-7' : ''}`}>
              <CardHeader>
                <CardTitle>Cargas Recientes</CardTitle>
                <CardDescription>
                  {stats.pending_uploads > 0 
                    ? `Tienes ${stats.pending_uploads} cargas pendientes` 
                    : "Últimas cargas realizadas"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentUploads data={stats.recent_uploads} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actividad de Usuarios - Solo se muestra si hay usuarios activos */}
        {stats && stats.active_users > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Actividad de Usuarios</CardTitle>
                <Link href="/users">
                  <Button variant="ghost" className="flex items-center text-sm">
                    Ver Todos los Usuarios
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <UserActivity />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

