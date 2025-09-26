import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users as UsersIcon, Plus, UserPlus, UserMinus, Edit, Crown, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';

interface UserWithTeams {
  user_id: string;
  name: string | null;
  email: string;
  is_admin: boolean;
  teams: Array<{
    team_id: string;
    team_name: string;
    role: string;
  }>;
}

interface Team {
  id: string;
  name: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserWithTeams[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddToTeamOpen, setIsAddToTeamOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [submitting, setSubmitting] = useState(false);
  const [removeFromTeam, setRemoveFromTeam] = useState<{userId: string, teamId: string, teamName: string} | null>(null);
  
  const { toast } = useToast();
  const { isAdmin, isManager } = useUserRole();
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.user_id) {
      fetchUsers();
      fetchTeams();
    }
  }, [profile]);

  const canManageUsers = () => {
    return isAdmin || isManager || checkIfTeamLeader();
  };

  const checkIfTeamLeader = () => {
    if (!profile?.user_id) return false;
    
    // Check if any user in the users list has this profile user_id as a manager
    return users.some(user => 
      user.teams.some(team => 
        team.role === 'MANAGER' && 
        user.user_id === profile.user_id
      )
    );
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email, is_admin')
        .order('name');

      if (profilesError) throw profilesError;

      // Get all memberships with team info
      const { data: memberships, error: membershipsError } = await supabase
        .from('memberships')
        .select(`
          user_id,
          role,
          team_id,
          teams (
            id,
            name
          )
        `);

      if (membershipsError) throw membershipsError;

      // Combine the data
      const usersWithTeams: UserWithTeams[] = (profiles || []).map(profile => {
        const userMemberships = (memberships || []).filter(m => m.user_id === profile.user_id);
        
        return {
          ...profile,
          teams: userMemberships.map(m => ({
            team_id: m.team_id,
            team_name: (m.teams as any)?.name || 'Unknown Team',
            role: m.role
          }))
        };
      });

      setUsers(usersWithTeams);
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

  const handleAddToTeam = async () => {
    if (!selectedUserId || !selectedTeamId) return;

    try {
      setSubmitting(true);

      // Check if user is already in the team
      const { data: existingMembership } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', selectedUserId)
        .eq('team_id', selectedTeamId)
        .single();

      if (existingMembership) {
        toast({
          title: "Error",
          description: "User is already a member of this team",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('memberships')
        .insert([{
          team_id: selectedTeamId,
          user_id: selectedUserId,
          role: selectedRole
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User added to team successfully",
      });

      setIsAddToTeamOpen(false);
      setSelectedUserId('');
      setSelectedTeamId('');
      setSelectedRole('EMPLOYEE');
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user to team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user to team",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromTeam = async () => {
    if (!removeFromTeam) return;

    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('user_id', removeFromTeam.userId)
        .eq('team_id', removeFromTeam.teamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User removed from ${removeFromTeam.teamName} successfully`,
      });

      setRemoveFromTeam(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error removing user from team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from team",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'MANAGER':
        return Crown;
      default:
        return User;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'MANAGER':
        return 'Team Leader';
      case 'EMPLOYEE':
        return 'Team Member';
      default:
        return 'Member';
    }
  };

  if (!canManageUsers()) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="p-6">
          <div className="text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to manage users. Only admins, managers, and team leaders can access this page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <Dialog open={isAddToTeamOpen} onOpenChange={setIsAddToTeamOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add to Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User to Team</DialogTitle>
              <DialogDescription>
                Select a user and team, then assign their role.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">Select User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.filter(u => !u.is_admin).map((user) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.name || user.email} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">Select Team</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={(value: 'EMPLOYEE' | 'MANAGER') => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Team Member</SelectItem>
                    <SelectItem value="MANAGER">Team Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddToTeamOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddToTeam} 
                disabled={submitting || !selectedUserId || !selectedTeamId}
              >
                {submitting ? 'Adding...' : 'Add to Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No users found
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.user_id}>
              <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <User className="h-5 w-5 text-primary" />
                     <div>
                       <div className="flex items-center gap-2">
                         {user.name || 'No name'}
                         {user.is_admin && (
                           <Badge variant="destructive">
                             <Crown className="h-3 w-3 mr-1" />
                             Admin
                           </Badge>
                         )}
                       </div>
                       <p className="text-sm text-muted-foreground font-normal">
                         {user.email}
                       </p>
                     </div>
                   </div>
                 </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Teams</span>
                    <Badge variant="secondary">{user.teams.length}</Badge>
                  </div>
                  
                  {user.teams.length > 0 ? (
                    <div className="space-y-2">
                      {user.teams.map((team) => {
                        const RoleIcon = getRoleIcon(team.role);
                        return (
                          <div key={`${team.team_id}-${user.user_id}`} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              <RoleIcon className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{team.team_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getRoleLabel(team.role)}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemoveFromTeam({
                                userId: user.user_id,
                                teamId: team.team_id,
                                teamName: team.team_name
                              })}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Not assigned to any team
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Remove from Team Confirmation Dialog */}
      <Dialog open={removeFromTeam !== null} onOpenChange={() => setRemoveFromTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user from {removeFromTeam?.teamName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveFromTeam(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveFromTeam}
            >
              Remove from Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}