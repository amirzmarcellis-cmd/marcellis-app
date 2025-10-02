import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users2, Plus, DollarSign, Truck, User, Crown, Trash2, UserPlus, UserMinus, Pencil } from 'lucide-react';
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
  is_admin: boolean;
  role: string; // Add role from membership
  jobCount?: number; // Number of jobs assigned
}

interface NewTeamData {
  name: string;
}

interface AvailableUser {
  user_id: string;
  name: string | null;
  email: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState<NewTeamData>({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'TEAM_LEADER'>('EMPLOYEE');
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
  const [removeMemberTeamId, setRemoveMemberTeamId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAdmin, isManager } = useUserRole();
  const { profile } = useProfile();

  useEffect(() => {
    initializeTeams();
  }, []);

  const initializeTeams = async () => {
    try {
      setLoading(true);
      
      // Check if default teams exist, if not create them
      const { data: existingTeams, error: fetchError } = await supabase
        .from('teams')
        .select('*')
        .in('name', ['Sales Team', 'Delivery Team']);

      if (fetchError) throw fetchError;

      const teamNames = existingTeams?.map(t => t.name) || [];
      
      // Create missing default teams
      const teamsToCreate = [];
      if (!teamNames.includes('Sales Team')) {
        teamsToCreate.push({ name: 'Sales Team' });
      }
      if (!teamNames.includes('Delivery Team')) {
        teamsToCreate.push({ name: 'Delivery Team' });
      }

      if (teamsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('teams')
          .insert(teamsToCreate);

        if (insertError) throw insertError;
      }

      // Fetch all teams
      await fetchTeams();
    } catch (error) {
      console.error('Error initializing teams:', error);
      toast({
        title: "Error",
        description: "Failed to initialize teams",
        variant: "destructive"
      });
    }
  };

  const fetchTeams = async () => {
    try {
      let teamsQuery = supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is not admin but is a team leader, only show their teams
      if (!isAdmin && profile?.user_id) {
        // Get teams where user is a member
        const { data: userMemberships } = await supabase
          .from('memberships')
          .select('team_id')
          .eq('user_id', profile.user_id);

        if (userMemberships && userMemberships.length > 0) {
          const teamIds = userMemberships.map(m => m.team_id);
          teamsQuery = teamsQuery.in('id', teamIds);
        } else if (!isAdmin) {
          // If not admin and has no memberships, show no teams
          setTeams([]);
          setTeamMembers({});
          setLoading(false);
          return;
        }
      }

      const { data, error } = await teamsQuery;

      if (error) throw error;
      setTeams(data || []);

      // Fetch members for each team (two-step to avoid typed joins)
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
            .select('user_id, name, email, is_admin, linkedin_id')
            .in('user_id', userIds);

          if (profilesError) {
            console.error('Error fetching profiles for team', team.name, ':', profilesError);
            return { teamId: team.id, members: [] };
          }

          // Fetch job counts for each user
          const jobCountsMap: Record<string, number> = {};
          if (profiles && profiles.length > 0) {
            const linkedinIds = profiles.map(p => p.linkedin_id).filter(Boolean);
            
            if (linkedinIds.length > 0) {
              const { data: jobs, error: jobsError } = await supabase
                .from('Jobs')
                .select('recruiter_id')
                .in('recruiter_id', linkedinIds);
              
              if (!jobsError && jobs) {
                jobs.forEach((job) => {
                  if (job.recruiter_id) {
                    jobCountsMap[job.recruiter_id] = (jobCountsMap[job.recruiter_id] || 0) + 1;
                  }
                });
              }
            }
          }

          const members = (profiles || [])
            .map((p) => {
              const membership = memberships.find(m => m.user_id === p.user_id);
              return {
                id: p.user_id,
                name: p.name,
                email: p.email,
                is_admin: p.is_admin,
                role: membership?.role || 'EMPLOYEE',
                jobCount: jobCountsMap[p.linkedin_id || ''] || 0,
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

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name: newTeam.name }])
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully",
      });

      setNewTeam({ name: '' });
      setIsAddTeamOpen(false);
      fetchTeams();
    } catch (error: any) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create team",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      console.log('Attempting to delete team:', teamId);
      
      // First, delete all memberships for this team
      const { error: membershipError } = await supabase
        .from('memberships')
        .delete()
        .eq('team_id', teamId);

      if (membershipError) {
        console.error('Error deleting memberships:', membershipError);
        throw new Error(`Failed to remove team members: ${membershipError.message}`);
      }

      // Then delete the team
      const { error, data } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .select();

      console.log('Delete result:', { error, data });

      if (error) {
        console.error('Error deleting team:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });

      setDeleteTeamId(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive"
      });
    }
  };

  const openEditTeamDialog = (team: Team) => {
    setEditTeamId(team.id);
    setEditTeamName(team.name);
    setIsEditTeamOpen(true);
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editTeamId) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('teams')
        .update({ name: editTeamName })
        .eq('id', editTeamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team updated successfully",
      });

      setIsEditTeamOpen(false);
      setEditTeamId(null);
      setEditTeamName('');
      fetchTeams();
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchAvailableUsers = async (teamId: string) => {
    try {
      // Get all profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email, is_admin')
        .eq('is_admin', false); // Exclude admin users

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

  const handleAddMember = async () => {
    if (!selectedTeamId || !selectedUserId) return;

    try {
      setSubmitting(true);

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
        description: "Team member added successfully",
      });

      setIsAddMemberOpen(false);
      setSelectedUserId('');
      setSelectedRole('EMPLOYEE');
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
    fetchAvailableUsers(teamId);
    setIsAddMemberOpen(true);
  };

  const canManageTeamMembers = () => {
    return isAdmin || isManager || checkIfTeamLeader();
  };

  const checkIfTeamLeader = () => {
    if (!profile?.user_id) return false;
    
    // Check if user is a team leader in any team
    for (const members of Object.values(teamMembers)) {
      const member = members.find(m => m.id === profile.user_id);
      if (member && member.role === 'TEAM_LEADER') {
        return true;
      }
    }
    return false;
  };

  const getTeamIcon = (teamName: string) => {
    if (teamName.toLowerCase().includes('sales')) return DollarSign;
    if (teamName.toLowerCase().includes('delivery')) return Truck;
    return Users2;
  };

  const getRoleDisplay = (member: TeamMember) => {
    // First check if admin (overrides membership role)
    if (member.is_admin) {
      return { label: 'Admin', icon: Crown };
    }
    
    // Then check membership role
    switch (member.role) {
      case 'TEAM_LEADER':
        return { label: 'Team Leader', icon: Crown };
      case 'EMPLOYEE':
        return { label: 'Team Member', icon: User };
      default:
        return { label: 'Member', icon: User };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Teams</h1>
        </div>
        <Dialog open={isAddTeamOpen} onOpenChange={setIsAddTeamOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team</DialogTitle>
              <DialogDescription>
                Create a new team for the organization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTeam} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddTeamOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Team'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading teams...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No teams found
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {teams.map((team) => {
            const TeamIcon = getTeamIcon(team.name);
            const members = teamMembers[team.id] || [];
            
            return (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TeamIcon className="h-5 w-5 text-primary" />
                      {team.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTeamDialog(team)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTeamId(team.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{members.length}</Badge>
                        {canManageTeamMembers() && (
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
                    
                    {members.length > 0 ? (
                      <ScrollArea className={`${team.name.toLowerCase().includes('delivery') ? 'h-80 pr-2' : (members.length > 2 ? 'h-48' : 'h-auto')} w-full`}>
                        <div className="space-y-2 pr-2">
                          {members.map((member) => {
                            const roleDisplay = getRoleDisplay(member);
                            const RoleIcon = roleDisplay.icon;
                             return (
                               <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                 <div className="flex items-center gap-2">
                                   <User className="h-4 w-4" />
                                   <div className="flex flex-col">
                                     <span className="text-sm font-medium">{member.name || 'No name'}</span>
                                     <span className="text-xs text-muted-foreground">{member.email}</span>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <Badge variant="outline" className="text-xs">
                                     {member.jobCount || 0} jobs
                                   </Badge>
                                   <RoleIcon className="h-3 w-3" />
                                   <span className="text-xs text-muted-foreground">
                                     {roleDisplay.label}
                                   </span>
                                   {canManageTeamMembers() && (
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => {
                                         setRemoveMemberId(member.id);
                                         setRemoveMemberTeamId(team.id);
                                       }}
                                       className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive ml-2"
                                     >
                                       <UserMinus className="h-3 w-3" />
                                     </Button>
                                   )}
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No members assigned
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update the team name.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTeam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTeamName">Team Name</Label>
              <Input
                id="editTeamName"
                type="text"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditTeamOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Team'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation Dialog */}
      <Dialog open={deleteTeamId !== null} onOpenChange={() => setDeleteTeamId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be undone and will remove all associated memberships.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTeamId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteTeamId && handleDeleteTeam(deleteTeamId)}
            >
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Select a user to add to the team and assign their role.
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
                  {availableUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.name || user.email} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={(value: 'EMPLOYEE' | 'TEAM_LEADER') => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Team Member</SelectItem>
                  <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember} 
              disabled={submitting || !selectedUserId}
            >
              {submitting ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog open={removeMemberId !== null} onOpenChange={() => setRemoveMemberId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMemberId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveMember}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}