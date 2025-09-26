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
import { Users2, Plus, User, UserPlus, UserMinus, Trash2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';

interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface AvailableUser {
  user_id: string;
  name: string | null;
  email: string;
}

export default function TeamUsers() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [removeMemberTeamId, setRemoveMemberTeamId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [addMemberType, setAddMemberType] = useState<'existing' | 'new'>('new');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const { toast } = useToast();
  const { isTeamLeader, isAdmin } = useUserRole();
  const { profile } = useProfile();

  useEffect(() => {
    if (isTeamLeader || isAdmin) {
      fetchTeams();
    }
  }, [isTeamLeader, isAdmin]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      // Show all teams for team leaders
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTeams(data || []);

      // Fetch members for each team
      if (data) {
        const membersPromises = data.map(async (team) => {
          const { data: memberships, error: membersError } = await supabase
            .from('memberships')
            .select('user_id, role')
            .eq('team_id', team.id);

          if (membersError) {
            console.error('Error fetching memberships for team', team.name, ':', membersError);
            return { teamId: team.id, members: [] };
          }

          if (!memberships || memberships.length === 0) {
            return { teamId: team.id, members: [] };
          }

          const userIds = memberships.map((m) => m.user_id);
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, name, email, is_admin')
            .in('user_id', userIds);

          if (profilesError) {
            console.error('Error fetching profiles for team', team.name, ':', profilesError);
            return { teamId: team.id, members: [] };
          }

          const members = (profiles || [])
            .filter(p => !p.is_admin) // Filter out admin users
            .map((p) => {
              const membership = memberships.find(m => m.user_id === p.user_id);
              return {
                id: p.user_id,
                name: p.name,
                email: p.email,
                role: membership?.role || 'EMPLOYEE',
              };
            });

          return {
            teamId: team.id,
            members,
          };
        });

        const membersResults = await Promise.all(membersPromises);
        const membersMap: Record<string, TeamMember[]> = {};
        membersResults.forEach(({ teamId, members }) => {
          membersMap[teamId] = members;
        });
        setTeamMembers(membersMap);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch teams',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async (teamId: string) => {
    try {
      // Get all profiles (excluding admins)
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email, is_admin')
        .eq('is_admin', false);

      if (profilesError) throw profilesError;

      // Get current team members
      const { data: currentMemberships, error: membershipsError } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('team_id', teamId);

      if (membershipsError) throw membershipsError;

      const currentMemberIds = currentMemberships?.map(m => m.user_id) || [];
      
      // Filter out current team members
      const available = (allProfiles || []).filter(
        profile => !currentMemberIds.includes(profile.user_id)
      );

      setAvailableUsers(available);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available users",
        variant: "destructive"
      });
    }
  };

  const handleAddExistingMember = async () => {
    if (!selectedTeamId || !selectedUserId) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('memberships')
        .insert([{
          team_id: selectedTeamId,
          user_id: selectedUserId,
          role: 'EMPLOYEE'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member added successfully",
      });

      setIsAddMemberOpen(false);
      setSelectedUserId('');
      fetchTeams();
    } catch (error: any) {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateNewUser = async () => {
    if (!selectedTeamId || !newUserData.name || !newUserData.email || !newUserData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'create_team_member',
          userData: {
            email: newUserData.email,
            password: newUserData.password,
            name: newUserData.name,
            teamId: selectedTeamId
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "New team member created and added successfully",
      });

      setIsAddMemberOpen(false);
      setNewUserData({ name: '', email: '', password: '' });
      fetchTeams();
    } catch (error: any) {
      console.error('Error creating new user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create new team member",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMemberId || !removeMemberTeamId) return;

    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('team_id', removeMemberTeamId)
        .eq('user_id', removeMemberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      setRemoveMemberId(null);
      setRemoveMemberTeamId(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive"
      });
    }
  };

  const openAddMemberDialog = (teamId: string) => {
    setSelectedTeamId(teamId);
    setAddMemberType('new');
    setNewUserData({ name: '', email: '', password: '' });
    fetchAvailableUsers(teamId);
    setIsAddMemberOpen(true);
  };

  const canManageTeam = (teamId: string) => {
    if (isAdmin) return true;
    if (!isTeamLeader || !profile?.user_id) return false;
    
    // Check if user is a manager of this specific team
    const members = teamMembers[teamId] || [];
    return members.some(m => m.id === profile.user_id && m.role === 'MANAGER');
  };

  if (!isTeamLeader && !isAdmin) {
    return (
      <div className="text-center py-8">
        <Users2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You need to be a team leader to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Team Members</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No teams available for management
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {teams.map((team) => {
            const members = teamMembers[team.id] || [];
            const canManage = canManageTeam(team.id);
            
            return (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-5 w-5 text-primary" />
                      {team.name}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Team Members</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{members.filter(m => m.role === 'EMPLOYEE').length}</Badge>
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAddMemberDialog(team.id)}
                            className="h-6 px-2"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {members.filter(m => m.role === 'EMPLOYEE').length > 0 ? (
                      <div className="space-y-2">
                        {members
                          .filter(m => m.role === 'EMPLOYEE') // Only show team members, not managers
                          .map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{member.name || 'No name'}</span>
                                  <span className="text-xs text-muted-foreground">{member.email}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Team Member</Badge>
                                {canManage && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setRemoveMemberId(member.id);
                                      setRemoveMemberTeamId(team.id);
                                    }}
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                  >
                                    <UserMinus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No team members
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Team Member
            </DialogTitle>
            <DialogDescription>
              Create a new user or add an existing user to the team.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={addMemberType} onValueChange={(value) => setAddMemberType(value as 'existing' | 'new')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </TabsTrigger>
              <TabsTrigger value="existing" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Add Existing
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  A new user account will be created and added to the team as a member.
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="existing" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          <div className="flex flex-col">
                            <span>{user.name || 'No name'}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  Select an existing user who is not already a member of this team.
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddMemberOpen(false);
                setNewUserData({ name: '', email: '', password: '' });
                setSelectedUserId('');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={addMemberType === 'new' ? handleCreateNewUser : handleAddExistingMember}
              disabled={submitting || (addMemberType === 'new' ? !newUserData.name || !newUserData.email || !newUserData.password : !selectedUserId)}
            >
              {submitting ? 'Processing...' : addMemberType === 'new' ? 'Create & Add' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog 
        open={removeMemberId !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setRemoveMemberId(null);
            setRemoveMemberTeamId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the team?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setRemoveMemberId(null);
                setRemoveMemberTeamId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}