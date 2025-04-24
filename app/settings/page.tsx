import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <Button>Guardar Cambios</Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Configurar cómo recibe las notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por Correo</Label>
                <p className="text-sm text-muted-foreground">
                  Recibir notificaciones por correo sobre actualizaciones importantes
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones de Escritorio</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificaciones de escritorio para nuevas cargas
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Cuenta</CardTitle>
            <CardDescription>Actualizar sus preferencias de cuenta</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de Visualización</Label>
              <Input id="name" placeholder="Dr. Juan Pérez" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Dirección de Correo</Label>
              <Input id="email" type="email" placeholder="doctor@hospital.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Idioma</Label>
              <Select>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Seleccionar Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">Inglés</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Francés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacidad</CardTitle>
            <CardDescription>Gestionar su configuración de privacidad</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-muted-foreground">
                  Añadir una capa adicional de seguridad a su cuenta
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registro de Actividad</Label>
                <p className="text-sm text-muted-foreground">
                  Mantener un registro de la actividad de su cuenta
                </p>
              </div>
              <Button variant="outline">Ver Registro</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 