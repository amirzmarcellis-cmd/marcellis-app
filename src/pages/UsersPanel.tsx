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
import { Users, Plus, Mail, User, Shield, Trash2, Crown, Briefcase, DollarSign, Truck, UserCheck, Users2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import Teams from './Teams';

type UserRole = 'admin' | 'management' | 'team_member' | 'team_leader';

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
  is_admin: boolean;
  role?: UserRole;
  created_at: string;
  updated_at: string;
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
];

const getRoleDisplay = (user: Profile, userMemberships: Array<{team_id: string, role: string, team_name: string}>, isAdmin?: boolean) => {
  // For backwards compatibility, check is_admin first
  if (isAdmin || user.is_admin) {
    return { label: 'Admin', icon: Crown, variant: 'default' as const };
  }
  
  // Check if user has team roles
  if (userMemberships.length > 0) {
    const membership = userMemberships[0]; // Take the first membership
    switch (membership.role) {
      case 'MANAGER':
        return { label: 'Team Leader', icon: UserCheck, variant: 'secondary' as const };
      case 'EMPLOYEE':
        return { label: 'Team Member', icon: Users, variant: 'secondary' as const };
    }
  }
  
  return { label: 'User', icon: User, variant: 'secondary' as const };
};

export default function UsersPanel() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userMembershipsMap, setUserMembershipsMap] = useState<Record<string, Array<{team_id: string, role: string, team_name: string}>>>({});
  const [loading, setLoading] = useState(true);
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
  const { toast } = useToast();
  const { session } = useAuth();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchUsers();
    fetchTeams();
    fetchUserTeams();
    fetchUserMemberships();
  }, [session]);

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
      
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create_user',
          userData: {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            is_admin: newUser.role === 'admin', // Set admin based on role
            role: newUser.role,
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
      fetchUserMemberships(); // Refresh memberships when user is deleted
      fetchUserMemberships(); // Refresh memberships when new user is added
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        {isAdmin && (
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
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
                {(newUser.role === 'management' || newUser.role === 'team_member' || newUser.role === 'team_leader') && (
                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Select value={newUser.team} onValueChange={(value: string) => setNewUser({ ...newUser, team: value })}>
                      <SelectTrigger className="bg-background border-input z-50">
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border shadow-md z-50">
                        {userTeams.map((team) => {
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
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users2 className="h-4 w-4" />
            Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {user.name || 'No name'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const roleDisplay = getRoleDisplay(user, userMembershipsMap[user.user_id] || [], user.is_admin);
                        const Icon = roleDisplay.icon;
                        const userMemberships = userMembershipsMap[user.user_id] || [];
                        return (
                          <div className="space-y-1">
                            <Badge variant={roleDisplay.variant}>
                              <Icon className="h-3 w-3 mr-1" />
                              {roleDisplay.label}
                            </Badge>
                            {userMemberships.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {userMemberships.map((membership, idx) => (
                                  <div key={idx}>
                                    {membership.team_name} ({membership.role === 'MANAGER' ? 'Leader' : 'Member'})
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="teams">
          <Teams />
        </TabsContent>
      </Tabs>
    </div>
  );
}