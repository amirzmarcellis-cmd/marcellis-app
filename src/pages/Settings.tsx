import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, Settings as SettingsIcon, Palette } from "lucide-react"
import { useState } from "react"
import { useAppSettings } from "@/contexts/AppSettingsContext"
import { toast } from "sonner"

export default function Settings() {
  const { settings, updateSettings } = useAppSettings();
  const [systemName, setSystemName] = useState(settings.systemName)
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor)
  const [logo, setLogo] = useState<File | null>(null)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLogo(file)
      // Convert file to base64 for storage
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateSettings({ logo: result })
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
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label htmlFor="logo">System Logo</Label>
                <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center">
                  {settings.logo ? (
                    <img 
                      src={settings.logo} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : logo ? (
                    <img 
                      src={URL.createObjectURL(logo)} 
                      alt="Logo preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-white" />
                  )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="bg-background/50 border-glass-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 64x64px, PNG or SVG format
                    </p>
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
                        primaryColor === color ? 'border-white shadow-white/30 shadow-md' : 'border-glass-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    >
                      {primaryColor === color && (
                        <div className="absolute inset-0 rounded-lg border-2 border-white animate-pulse" />
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
                    {settings.logo ? (
                      <img 
                        src={settings.logo} 
                        alt="Logo" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : logo ? (
                      <img 
                        src={URL.createObjectURL(logo)} 
                        alt="Logo" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Upload className="w-5 h-5 text-white" />
                    )}
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