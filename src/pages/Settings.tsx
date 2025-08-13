import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Settings as SettingsIcon, Palette } from "lucide-react"
import { useState } from "react"
import { useAppSettings } from "@/contexts/AppSettingsContext"
import { toast } from "sonner"
import { useTheme } from "next-themes"

export default function Settings() {
  const { settings, updateSettings } = useAppSettings();
  const [systemName, setSystemName] = useState(settings.systemName)
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor)
  const [lightLogo, setLightLogo] = useState<File | null>(null)
  const [darkLogo, setDarkLogo] = useState<File | null>(null)
  const { theme } = useTheme()

  const handleLightLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLightLogo(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateSettings({ logoLight: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDarkLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setDarkLogo(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateSettings({ logoDark: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    updateSettings({ 
      systemName, 
      primaryColor
    })
    toast.success("Settings saved successfully!")
  }

  // Update colors immediately when changed
  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    updateSettings({ primaryColor: color });
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Settings</h1>
          <p className="text-muted-foreground">Customize your system appearance and branding</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* System Branding */}
          <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                System Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Light Logo (used in Dark mode) */}
                <div className="space-y-2">
                  <Label htmlFor="logoLight">Light Logo (used in Dark Mode)</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
                      {settings.logoLight ? (
                        <img
                          src={settings.logoLight}
                          alt="Light logo preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : lightLogo ? (
                        <img
                          src={URL.createObjectURL(lightLogo)}
                          alt="Light logo preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="logoLight"
                        type="file"
                        accept="image/*"
                        onChange={handleLightLogoUpload}
                        className="bg-background/50 border-glass-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Recommended: 64x64px, PNG or SVG</p>
                    </div>
                  </div>
                </div>

                {/* Dark Logo (used in Light mode) */}
                <div className="space-y-2">
                  <Label htmlFor="logoDark">Dark Logo (used in Light Mode)</Label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
                      {settings.logoDark ? (
                        <img
                          src={settings.logoDark}
                          alt="Dark logo preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : darkLogo ? (
                        <img
                          src={URL.createObjectURL(darkLogo)}
                          alt="Dark logo preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="logoDark"
                        type="file"
                        accept="image/*"
                        onChange={handleDarkLogoUpload}
                        className="bg-background/50 border-glass-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Recommended: 64x64px, PNG or SVG</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Name */}
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="Enter your system name"
                  className="bg-background/50 border-glass-border"
                />
              </div>

              {/* Primary Color */}
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-glass-border shadow-inner"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div className="flex-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="bg-background/50 border-glass-border h-12"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-2 mt-3">
                  {[
                    "#00FFFF", // Cyan
                    "#3B82F6", // Blue  
                    "#8B5CF6", // Purple
                    "#10B981", // Green
                    "#F59E0B", // Orange
                    "#EF4444", // Red
                    "#EC4899", // Pink
                    "#06B6D4", // Sky Blue
                    "#8B5A2B", // Brown
                    "#6B7280", // Gray
                    "#F97316", // Orange Red
                    "#84CC16", // Lime
                    "#A855F7", // Violet
                    "#14B8A6", // Teal
                    "#F43F5E", // Rose
                    "#6366F1"  // Indigo
                  ].map((color) => (
                    <button
                      key={color}
                      className={`relative w-10 h-10 rounded-lg border-2 hover:scale-110 transition-all duration-200 hover:shadow-lg ${
                        primaryColor === color ? 'border-border shadow-primary/30 shadow-md' : 'border-glass-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    >
                      {primaryColor === color && (
                        <div className="absolute inset-0 rounded-lg border-2 border-primary animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-background border border-glass-border">
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {(() => {
                      const previewSrc = theme === 'dark'
                        ? (settings.logoLight || (lightLogo ? URL.createObjectURL(lightLogo) : ''))
                        : (settings.logoDark || (darkLogo ? URL.createObjectURL(darkLogo) : ''));
                      return previewSrc ? (
                        <img
                          src={previewSrc}
                          alt="Logo"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Upload className="w-5 h-5 text-white" />
                      );
                    })()}
                  </div>
                  <h3 className="font-semibold text-lg">{systemName}</h3>
                </div>
                <div className="space-y-2">
                  <div 
                    className="h-2 rounded-full w-full"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <div 
                      className="h-2 rounded-full w-3/4"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Sample progress bar with your primary color</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-gradient-primary hover:bg-gradient-primary/90">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
  )
}