import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users2, Plus, User, UserPlus, UserMinus, Mail, Lock, Shield, Crown, Settings, Edit } from 'lucide-react';
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
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamMember | null>(null);
  const [editUserData, setEditUserData] = useState({
    name: '',
    email: '',
    role: ''
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

  const openEditUserDialog = (user: TeamMember, teamId: string) => {
    setEditingUser(user);
    setSelectedTeamId(teamId);
    setEditUserData({
      name: user.name || '',
      email: user.email,
      role: user.role
    });
    setIsEditUserOpen(true);
  };

  const handleEditUser = async () => {
    if (!editingUser || !selectedTeamId || !editUserData.name || !editUserData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
          action: 'update_user',
          userData: {
            userId: editingUser.id,
            name: editUserData.name,
            email: editUserData.email,
            role: editUserData.role,
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
        description: "User updated successfully",
      });

      setIsEditUserOpen(false);
      setEditingUser(null);
      setEditUserData({ name: '', email: '', role: '' });
      fetchTeams();
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

  const canManageTeam = (teamId: string) => {
    if (isAdmin) return true;
    if (!isTeamLeader || !profile?.user_id) return false;
    
    // Check if user is a manager of this specific team
    const members = teamMembers[teamId] || [];
    return members.some(m => m.id === profile.user_id && m.role === 'MANAGER');
  };

  if (!isTeamLeader && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <Shield className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              You need to be a team leader to manage team members. Contact your administrator for access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
              <p className="text-muted-foreground">Manage your team members and organization structure</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Crown className="h-4 w-4 mr-2" />
            {isAdmin ? 'Administrator' : 'Team Leader'}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading teams...</p>
          </div>
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <Users2 className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Teams Found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            There are no teams available for management at this time.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => {
            const members = teamMembers[team.id] || [];
            const canManage = canManageTeam(team.id);
            const teamEmployees = members.filter(m => m.role === 'EMPLOYEE');
            const teamManagers = members.filter(m => m.role === 'MANAGER');
            
            return (
              <Card key={team.id} className="group hover:shadow-lg transition-all duration-200 border-muted/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                        <Users2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {team.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {teamEmployees.length + teamManagers.length} total members
                        </p>
                      </div>
                    </div>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openAddMemberDialog(team.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Team Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold">{teamManagers.length}</div>
                      <div className="text-xs text-muted-foreground">Managers</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-lg font-semibold">{teamEmployees.length}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                  </div>

                  <Separator />

                  {/* Team Members List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Team Members</span>
                      {canManage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAddMemberDialog(team.id)}
                          className="h-8 px-3 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Member
                        </Button>
                      )}
                    </div>
                    
                    <ScrollArea className="h-80 pr-2">
                      {/* Display Managers First */}
                      {teamManagers.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Team Managers</div>
                          {teamManagers.map((manager) => (
                            <div key={manager.id} className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-amber-100 text-amber-800">
                                    {manager.name ? manager.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'M'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{manager.name || 'No name'}</span>
                                  <span className="text-xs text-muted-foreground">{manager.email}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Manager</Badge>
                                {canManage && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditUserDialog(manager, team.id)}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setRemoveMemberId(manager.id);
                                        setRemoveMemberTeamId(team.id);
                                      }}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Display Team Members */}
                      {teamEmployees.length > 0 ? (
                        <div className="space-y-2">
                          {teamManagers.length > 0 && (
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Team Members</div>
                          )}
                          {teamEmployees.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">{member.name || 'No name'}</span>
                                  <span className="text-xs text-muted-foreground">{member.email}</span>
                                </div>
                              </div>
                               <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">Member</Badge>
                                {canManage && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditUserDialog(member, team.id)}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setRemoveMemberId(member.id);
                                        setRemoveMemberTeamId(team.id);
                                      }}
                                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <UserMinus className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : teamManagers.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No team members yet</p>
                          {canManage && (
                            <p className="text-xs mt-1">Click "Add Member" to get started</p>
                          )}
                        </div>
                      ) : null}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              Add Team Member
            </DialogTitle>
            <DialogDescription className="text-base">
              Create a new user account or add an existing user to the team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Tabs value={addMemberType} onValueChange={(value) => setAddMemberType(value as 'existing' | 'new')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 p-1">
                <TabsTrigger value="new" className="flex items-center gap-2 h-10">
                  <Plus className="h-4 w-4" />
                  Create New User
                </TabsTrigger>
                <TabsTrigger value="existing" className="flex items-center gap-2 h-10">
                  <User className="h-4 w-4" />
                  Add Existing User
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="new" className="mt-6 space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4 text-primary" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-4 w-4 text-primary" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                      <Lock className="h-4 w-4 text-primary" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password (min. 6 characters)"
                      value={newUserData.password}
                      onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                </div>
                
                <div className="bg-muted/50 border border-muted rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Account Details</h4>
                      <p className="text-sm text-muted-foreground">
                        A new user account will be created with team member privileges. 
                        The user will receive login credentials via email.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="existing" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select User</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Choose a user to add..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            <div className="flex items-center gap-3 py-1">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name || 'No name'}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="bg-muted/50 border border-muted rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Add Existing User</h4>
                      <p className="text-sm text-muted-foreground">
                        Select an existing user who is not already a member of this team. 
                        They will be added with standard team member permissions.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsAddMemberOpen(false);
                setNewUserData({ name: '', email: '', password: '' });
                setSelectedUserId('');
              }}
              className="h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={addMemberType === 'new' ? handleCreateNewUser : handleAddExistingMember}
              disabled={submitting || (addMemberType === 'new' ? !newUserData.name || !newUserData.email || !newUserData.password : !selectedUserId)}
              className="h-10 px-6"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                addMemberType === 'new' ? 'Create & Add Member' : 'Add to Team'
              )}
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <UserMinus className="h-5 w-5 text-destructive" />
              </div>
              Remove Team Member
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to remove this member from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-destructive">Warning</h4>
                  <p className="text-sm text-muted-foreground">
                    The user will lose access to this team's resources and will no longer be able to collaborate on team projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setRemoveMemberId(null);
                setRemoveMemberTeamId(null);
              }}
              className="h-10 px-6"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveMember}
              className="h-10 px-6"
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-name"
                  placeholder="Enter full name"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email address"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editUserData.role} onValueChange={(value) => setEditUserData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}