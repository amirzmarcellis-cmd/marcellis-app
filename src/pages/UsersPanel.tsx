import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserRole } from "@/hooks/useUserRole"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, Plus, Edit, Trash2, ArrowLeft, Shield, Crown, User as UserIcon } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface UserWithRoles {
  user_id: string
  name: string | null
  email: string
  user_created_at: string
  last_sign_in_at: string | null
  roles: string[]
}

const ROLE_OPTIONS = [
  { value: 'platform_admin', label: 'Platform Admin', icon: Crown, color: 'destructive' },
  { value: 'company_admin', label: 'Company Admin', icon: Shield, color: 'default' },
  { value: 'manager', label: 'Manager', icon: Shield, color: 'default' },
  { value: 'recruiter', label: 'Recruiter', icon: UserIcon, color: 'secondary' }
]

export default function UsersPanel() {
  const navigate = useNavigate()
  const { canManageUsers, canDeleteUsers, isSuperAdmin, isManager, loading: roleLoading } = useUserRole()
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [userRoles, setUserRoles] = useState<string[]>([])
  
  // Form states for add/edit user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // For now, fetch from profiles and manually get roles
      // TODO: Create a proper view for users with roles in multi-tenant context
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to match UserWithRoles interface
      const usersData: UserWithRoles[] = profiles?.map(profile => ({
        user_id: profile.user_id,
        name: profile.name,
        email: '', // TODO: Get from auth.users via RPC or view
        user_created_at: profile.created_at,
        last_sign_in_at: null, // TODO: Get from auth.users
        roles: [] // TODO: Get from company_users
      })) || []

      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const canEditUser = (user: UserWithRoles) => {
    // Super admins can edit anyone
    if (isSuperAdmin) return true
    
    // Managers cannot edit super admins
    if (isManager && user.roles?.includes('super_admin')) return false
    
    // Regular users based on canManageUsers permission
    return canManageUsers
  }

  const handleEditUser = (user: UserWithRoles) => {
    if (!canEditUser(user)) {
      toast.error('You do not have permission to edit this user')
      return
    }
    
    setSelectedUser(user)
    setUserRoles(user.roles || [])
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '' // Don't pre-fill password for security
    })
    setIsEditDialogOpen(true)
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setUserRoles([])
    setFormData({
      name: '',
      email: '',
      password: ''
    })
    setIsAddDialogOpen(true)
  }

  const handleCreateUser = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required')
      return
    }

    setIsSubmitting(true)
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Call edge function to create user
      const { data: result, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create_user',
          userData: {
            email: formData.email,
            password: formData.password,
            name: formData.name
          }
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to create user')
      }

      // Add roles if any selected
      if (userRoles.length > 0 && result.user?.user) {
        const rolesToInsert = userRoles.map(role => ({
          user_id: result.user.user.id,
          role: role as 'super_admin' | 'manager' | 'admin' | 'recruiter'
        }))

        const { error: rolesError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert)

        if (rolesError) console.error('Roles assignment error:', rolesError)
      }

      toast.success('User created successfully')
      setIsAddDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      toast.error(error.message || 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Call edge function to update user
      const { data: result, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'update_user',
          userId: selectedUser.user_id,
          userData: {
            email: formData.email,
            password: formData.password || undefined,
            name: formData.name
          }
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to update user')
      }

      // Update roles
      await handleSaveUserRoles()

      toast.success('User updated successfully')
      setIsEditDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      toast.error(error.message || 'Failed to update user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveUserRoles = async () => {
    if (!selectedUser) return

    try {
      // First, remove all existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.user_id)

      // Then add the new roles
      if (userRoles.length > 0) {
        const rolesToInsert = userRoles.map(role => ({
          user_id: selectedUser.user_id,
          role: role as 'super_admin' | 'manager' | 'admin' | 'recruiter'
        }))

        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(rolesToInsert)

        if (insertError) throw insertError
      }

      if (!isSubmitting) {
        toast.success('User roles updated successfully')
        setIsEditDialogOpen(false)
        fetchUsers()
      }
    } catch (error) {
      console.error('Error updating user roles:', error)
      if (!isSubmitting) {
        toast.error('Failed to update user roles')
      }
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Call edge function to delete user
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'delete_user',
          userId: userId
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to delete user')
      }

      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Failed to delete user')
    }
  }

  const toggleRole = (role: string) => {
    // Only allow one role selection for both adding and editing users
    setUserRoles([role])
  }

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '' })
    setUserRoles([])
  }

  const getRoleBadgeVariant = (role: string) => {
    const roleConfig = ROLE_OPTIONS.find(r => r.value === role)
    return roleConfig?.color as any || 'default'
  }

  const getRoleIcon = (role: string) => {
    const roleConfig = ROLE_OPTIONS.find(r => r.value === role)
    return roleConfig?.icon || UserIcon
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading || roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if user has permission to access this panel
  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to access the Users Panel.</p>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Users Panel
            </h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-gradient-card backdrop-blur-glass border-glass-border shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              {canManageUsers && (
                <Button onClick={handleAddUser} className="bg-gradient-primary hover:bg-gradient-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </div>
                      {user.name || 'Unnamed User'}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles?.length > 0 ? (
                        user.roles.map((role) => {
                          const Icon = getRoleIcon(role)
                          return (
                            <Badge key={role} variant={getRoleBadgeVariant(role)} className="flex items-center gap-1">
                              <Icon className="w-3 h-3" />
                              {ROLE_OPTIONS.find(r => r.value === role)?.label || role}
                            </Badge>
                          )
                        })
                      ) : (
                        <Badge variant="outline">No Roles</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        disabled={!canEditUser(user)}
                        title={!canEditUser(user) ? "You cannot edit this user" : "Edit user"}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {canDeleteUsers && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete {user.name || user.email}? 
                              This action cannot be undone and will remove the user from the system entirely.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="add-name">Full Name</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="add-password">Password *</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Assign Roles:</h4>
              {ROLE_OPTIONS.filter(roleOption => {
                // Managers can only assign Manager and Recruiter roles
                if (isManager && !isSuperAdmin) {
                  return roleOption.value === 'manager' || roleOption.value === 'recruiter';
                }
                return true;
              }).map((roleOption) => {
                const Icon = roleOption.icon
                const isSelected = userRoles.includes(roleOption.value)
                
                return (
                  <div
                    key={roleOption.value}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => toggleRole(roleOption.value)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{roleOption.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {roleOption.value === 'super_admin' && 'Full system access and user management'}
                          {roleOption.value === 'manager' && 'Manage candidates and jobs'}
                          {roleOption.value === 'recruiter' && 'Basic access to view and edit data'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded border ${
                      isSelected ? 'bg-primary border-primary' : 'border-border'
                    }`}>
                      {isSelected && (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="edit-password">New Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty to keep current password"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to keep the current password
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Assign Roles:</h4>
              {ROLE_OPTIONS.map((roleOption) => {
                const Icon = roleOption.icon
                const isSelected = userRoles.includes(roleOption.value)
                
                return (
                  <div
                    key={roleOption.value}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => toggleRole(roleOption.value)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{roleOption.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {roleOption.value === 'super_admin' && 'Full system access and user management'}
                          {roleOption.value === 'manager' && 'Manage candidates and jobs'}
                          {roleOption.value === 'recruiter' && 'Basic access to view and edit data'}
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded border ${
                      isSelected ? 'bg-primary border-primary' : 'border-border'
                    }`}>
                      {isSelected && (
                        <div className="w-full h-full flex items-center justify-center text-white text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}