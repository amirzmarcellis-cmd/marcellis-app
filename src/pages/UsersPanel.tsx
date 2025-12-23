import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Mail, User, Shield, Trash2, Crown, Briefcase, DollarSign, Truck, UserCheck, Users2, AlertTriangle, Edit, Linkedin, Search, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Teams from './Teams';

type UserRole = 'admin' | 'management' | 'team_member' | 'team_leader' | 'viewer';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  is_admin: boolean;
  role?: UserRole;
  created_at: string;
  updated_at: string;
  linkedin_id?: string | null;
}

interface NewUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  team?: string;
}

interface Team {
  id: string;
  name: string;
}

const roleOptions: { value: UserRole; label: string; icon: any }[] = [
  { value: 'admin', label: 'Admin', icon: Crown },
  { value: 'management', label: 'Management', icon: Briefcase },
  { value: 'team_member', label: 'Team Member', icon: Users },
  { value: 'team_leader', label: 'Team Leader', icon: UserCheck },
  { value: 'viewer', label: 'Viewer', icon: Eye },
];

const getRoleDisplay = (user: Profile, userMemberships: Array<{team_id: string, role: string, team_name: string}>, orgRole?: string) => {
  // Check organization role first (from user_roles table)
  if (orgRole === 'ADMIN') {
    return { label: 'Admin', icon: Crown, variant: 'default' as const };
  }
  
  if (orgRole === 'MANAGEMENT') {
    return { label: 'Management', icon: Briefcase, variant: 'default' as const };
  }

  if (orgRole === 'VIEWER') {
    return { label: 'Viewer', icon: Eye, variant: 'outline' as const };
  }
  
  // Check if user has team roles (from memberships table)
  if (userMemberships.length > 0) {
    const membership = userMemberships[0]; // Take the first membership
    switch (membership.role) {
      case 'TEAM_LEADER':
        return { label: 'Team Leader', icon: UserCheck, variant: 'secondary' as const };
      case 'EMPLOYEE':
        return { label: 'Team Member', icon: Users, variant: 'secondary' as const };
    }
  }
  
  return { label: 'Employee', icon: User, variant: 'secondary' as const };
};

export default function UsersPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userMembershipsMap, setUserMembershipsMap] = useState<Record<string, Array<{team_id: string, role: string, team_name: string}>>>({});
  const [userOrgRoles, setUserOrgRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUserData>({
    email: '',
    password: '',
    name: '',
    role: 'admin' // Default all users as admin as requested
  });
  const [submitting, setSubmitting] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [leaderTeams, setLeaderTeams] = useState<Team[]>([]);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: 'admin' as UserRole,
    team: undefined as string | undefined
  });
  const { toast } = useToast();
  const { session } = useAuth();
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });
  const { canAccessUsersPanel, loading: roleLoading, isAdmin } = useUserRole();

  // Move all useEffect hooks to top level before any conditional returns
  useEffect(() => {
    if (canAccessUsersPanel && !roleLoading && session) {
      fetchUsers();
      fetchTeams();
      fetchUserTeams();
      fetchUserMemberships();
      fetchUserOrgRoles();
    }
  }, [session, canAccessUsersPanel, roleLoading]);

  // Restrict access to admin users only
  if (!canAccessUsersPanel && !roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Access Restricted</h2>
              <p className="text-muted-foreground">
                You don't have permission to access the user management panel. Only administrators can view this section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserMemberships = async () => {
    try {
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select(`
          user_id,
          role,
          teams (
            id,
            name
          )
        `);

      if (error) throw error;

      const membershipsMap: Record<string, Array<{team_id: string, role: string, team_name: string}>> = {};
      
      memberships?.forEach((membership) => {
        if (!membershipsMap[membership.user_id]) {
          membershipsMap[membership.user_id] = [];
        }
        membershipsMap[membership.user_id].push({
          team_id: membership.teams?.id || '',
          role: membership.role,
          team_name: membership.teams?.name || ''
        });
      });

      setUserMembershipsMap(membershipsMap);
    } catch (error) {
      console.error('Error fetching user memberships:', error);
    }
  };

  const fetchUserOrgRoles = async () => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (error) throw error;

      const rolesMap: Record<string, string> = {};
      roles?.forEach((r) => {
        rolesMap[r.user_id] = r.role;
      });

      setUserOrgRoles(rolesMap);
    } catch (error) {
      console.error('Error fetching user org roles:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchUserTeams = async () => {
    if (!session?.user) return;
    
    try {
      // Fetch all teams for management, team member, and team leader roles
      const { data: allTeams, error: allTeamsError } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');
      
      if (allTeamsError) throw allTeamsError;
      setUserTeams(allTeams || []);
      
      // For team leaders, also show all available teams (admins can assign leaders to any team)
      setLeaderTeams(allTeams || []);
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "You must be logged in to create users",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create_user',
          userData: {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            org_role: newUser.role, // Use org_role for organization-level roles
            team: newUser.team
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });

      setNewUser({ email: '', password: '', name: '', role: 'admin' });
      setIsAddUserOpen(false);
      fetchUsers();
      fetchUserMemberships();
      fetchUserOrgRoles();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "You must be logged in to delete users",
        variant: "destructive"
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'delete_user',
          userId: userId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to delete user');
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const openEditUserDialog = (user: Profile) => {
    setEditingUser(user);
    const orgRole = userOrgRoles[user.user_id] || 'EMPLOYEE';
    const userMemberships = userMembershipsMap[user.user_id] || [];
    
    // Determine the role to display
    let role: UserRole = 'admin';
    let team: string | undefined = undefined;
    
    if (orgRole === 'ADMIN') {
      role = 'admin';
    } else if (orgRole === 'MANAGEMENT') {
      role = 'management';
    } else if (orgRole === 'VIEWER') {
      role = 'viewer';
    } else if (userMemberships.length > 0) {
      const membership = userMemberships[0];
      role = membership.role === 'TEAM_LEADER' ? 'team_leader' : 'team_member';
      team = membership.team_id;
    }
    
    setEditUserData({
      name: user.name || '',
      email: user.email,
      role: role,
      team: team
    });
    setIsEditUserOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editUserData.name || !editUserData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if ((editUserData.role === 'team_member' || editUserData.role === 'team_leader') && !editUserData.team) {
      toast({
        title: "Error",
        description: "Please select a team",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'update_user',
          userId: editingUser.user_id,
          userData: {
            name: editUserData.name,
            email: editUserData.email,
            org_role: editUserData.role,
            team: editUserData.team
          }
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to update user');
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setIsEditUserOpen(false);
      setEditingUser(null);
      setEditUserData({ name: '', email: '', role: 'admin', team: undefined });
      fetchUsers();
      fetchUserMemberships();
      fetchUserOrgRoles();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6 px-3 sm:px-0">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl font-bold">User Management</h1>
          </div>
          {canAccessUsersPanel && (
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add New User</DialogTitle>
                <DialogDescription className="text-sm">
                  Create a new user account for the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-sm">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value, team: undefined })}>
                    <SelectTrigger className="bg-background border-input z-50">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-md z-50">
                      {roleOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value} className="hover:bg-accent hover:text-accent-foreground">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <Select
                    value={newUser.team}
                    onValueChange={(value: string) => setNewUser({ ...newUser, team: value })}
                    disabled={!(newUser.role === 'team_member' || newUser.role === 'team_leader')}
                  >
                    <SelectTrigger className="bg-background border-input z-50">
                      <SelectValue placeholder={
                        newUser.role === 'team_member' || newUser.role === 'team_leader'
                          ? 'Select a team'
                          : 'Select role Team Member/Leader to choose a team'
                      } />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-md z-50">
                      {userTeams.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No teams available
                        </div>
                      ) : (
                        userTeams.map((team) => {
                          const TeamIcon = team.name.toLowerCase().includes('sales') ? DollarSign :
                                          team.name.toLowerCase().includes('delivery') ? Truck : Users2;
                          return (
                            <SelectItem key={team.id} value={team.id} className="hover:bg-accent hover:text-accent-foreground">
                              <div className="flex items-center gap-2">
                                <TeamIcon className="h-4 w-4" />
                                {team.name}
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-3 sm:space-y-6">
        <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-flex">
          <TabsTrigger value="users" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Users2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
        <CardHeader className="p-2 sm:p-6">
          <CardTitle className="text-sm sm:text-xl">
            All Users {!loading && `(${filteredUsers.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {/* Mobile Add User Button */}
          {canAccessUsersPanel && (
            <div className="sm:hidden mb-4">
              <Button className="w-full" onClick={() => setIsAddUserOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add User
              </Button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-4 text-sm">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {searchTerm ? 'No users match your search' : 'No users found'}
            </div>
          ) : (
            <>
              {/* Mobile Card List */}
              <div className="sm:hidden space-y-3">
                {filteredUsers.map((user) => {
                  const userMemberships = userMembershipsMap[user.user_id] || [];
                  const orgRole = userOrgRoles[user.user_id] || 'EMPLOYEE';
                  const roleDisplay = getRoleDisplay(user, userMemberships, orgRole);
                  const RoleIcon = roleDisplay.icon;
                  
                  return (
                    <div key={user.id} className="rounded-lg border p-3 bg-background">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{user.name || 'No name'}</div>
                          <div className="text-xs text-muted-foreground break-words mb-2">{user.email}</div>
                        </div>
                        <Badge variant={roleDisplay.variant} className="shrink-0 text-[10px] px-2 py-0.5">
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {roleDisplay.label}
                        </Badge>
                      </div>

                      {userMemberships.length > 0 && orgRole === 'EMPLOYEE' && (
                        <div className="mt-2 pt-2 border-t text-xs">
                          <div className="font-medium mb-1">Teams:</div>
                          <div className="text-muted-foreground space-y-0.5">
                            {userMemberships.map((membership, idx) => (
                              <div key={idx}>
                                {membership.team_name} ({membership.role === 'TEAM_LEADER' ? 'Leader' : 'Member'})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingUser(user);
                              setEditUserData({
                                name: user.name || '',
                                email: user.email,
                                role: (user.role || 'admin') as any,
                                team: undefined
                              });
                              setIsEditUserOpen(true);
                            }}
                            aria-label="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteUser(user.user_id)}
                            aria-label="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto -mx-2 sm:mx-0 rounded-md border sm:border-0">
                <Table className="min-w-[960px] sm:min-w-0 table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] sm:text-sm py-2 sticky left-0 bg-background z-10 w-[24%]">Name</TableHead>
                      <TableHead className="text-[10px] sm:text-sm py-2 w-[28%]">Email</TableHead>
                      <TableHead className="text-[10px] sm:text-sm py-2 w-[18%]">Role</TableHead>
                      <TableHead className="text-[10px] sm:text-sm py-2 w-[12%]">Created</TableHead>
                      <TableHead className="text-[10px] sm:text-sm py-2 sticky right-0 bg-background z-10 w-[18%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                       <TableRow key={user.id}>
                        <TableCell className="text-[10px] sm:text-sm py-2 sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="whitespace-normal break-words" title={user.name || "No name"}>{user.name || "No name"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-sm py-2">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="whitespace-normal break-words" title={user.email}>{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-sm py-2">
                          {(() => {
                            const orgRole = userOrgRoles[user.user_id] || 'EMPLOYEE';
                            const roleDisplay = getRoleDisplay(user, userMembershipsMap[user.user_id] || [], orgRole);
                            const Icon = roleDisplay.icon;
                            const userMemberships = userMembershipsMap[user.user_id] || [];
                            return (
                              <div className="space-y-0.5 sm:space-y-1">
                                <Badge variant={roleDisplay.variant} className="text-[9px] sm:text-xs px-1 py-0">
                                  <Icon className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                  {roleDisplay.label}
                                </Badge>
                                {userMemberships.length > 0 && orgRole === 'EMPLOYEE' && (
                                  <div className="text-[9px] sm:text-xs text-muted-foreground">
                                    {userMemberships.map((membership, idx) => (
                                      <div key={idx} className="whitespace-normal break-words">
                                        {membership.team_name} ({membership.role === 'TEAM_LEADER' ? 'Leader' : 'Member'})
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-sm py-2">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-sm py-2 sm:sticky sm:right-0 sm:bg-background sm:z-10">
                          <div className="flex items-center gap-0.5 sm:gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditUserDialog(user)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.user_id)}
                              className="text-destructive hover:text-destructive h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Teams />
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit User</DialogTitle>
            <DialogDescription className="text-sm">
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-sm">Name</Label>
              <Input
                id="edit-name"
                type="text"
                value={editUserData.name}
                onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-sm">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserData.email}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                required
              />
            </div>
            {isAdmin && editingUser && (
              <div className="space-y-1.5">
                <Label className="text-sm">LinkedIn Connection</Label>
                <div className="flex items-center gap-2 p-2 sm:p-3 rounded-md border bg-muted/50">
                  <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  {editingUser.linkedin_id ? (
                    <Badge variant="default" className="bg-blue-600 text-xs">Connected</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Not Connected</Badge>
                  )}
                  {editingUser.linkedin_id && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground ml-2 truncate">
                      ID: {editingUser.linkedin_id}
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="edit-role" className="text-sm">Role</Label>
              <Select value={editUserData.role} onValueChange={(value: UserRole) => setEditUserData({ ...editUserData, role: value, team: undefined })}>
                <SelectTrigger className="bg-background border-input z-50">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-50">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-accent hover:text-accent-foreground">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {(editUserData.role === 'team_member' || editUserData.role === 'team_leader') && (
              <div className="space-y-1.5">
                <Label htmlFor="edit-team" className="text-sm">Team</Label>
                <Select value={editUserData.team} onValueChange={(value: string) => setEditUserData({ ...editUserData, team: value })}>
                  <SelectTrigger className="bg-background border-input z-50">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-md z-50">
                    {teams.map((team) => {
                      const TeamIcon = team.name.toLowerCase().includes('sales') ? DollarSign : 
                                      team.name.toLowerCase().includes('delivery') ? Truck : Users2;
                      return (
                        <SelectItem key={team.id} value={team.id} className="hover:bg-accent hover:text-accent-foreground">
                          <div className="flex items-center gap-2">
                            <TeamIcon className="h-4 w-4" />
                            {team.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}