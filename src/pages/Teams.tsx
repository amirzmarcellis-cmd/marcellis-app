import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users2, Plus, DollarSign, Truck, User, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

interface NewTeamData {
  name: string;
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [newTeam, setNewTeam] = useState<NewTeamData>({ name: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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
            .select('user_id')
            .eq('team_id', team.id);

          if (membersError) throw membersError;
          
          if (!memberships || memberships.length === 0) {
            return { teamId: team.id, members: [] };
          }

          const userIds = memberships.map(m => m.user_id);
          
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, email, is_admin')
            .in('user_id', userIds);

          if (profilesError) throw profilesError;
          
          return {
            teamId: team.id,
            members: profiles || []
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
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
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

  const getTeamIcon = (teamName: string) => {
    if (teamName.toLowerCase().includes('sales')) return DollarSign;
    if (teamName.toLowerCase().includes('delivery')) return Truck;
    return Users2;
  };

  const getRoleIcon = (isAdmin?: boolean) => {
    if (isAdmin) return Crown;
    return User;
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
                  <CardTitle className="flex items-center gap-2">
                    <TeamIcon className="h-5 w-5 text-primary" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <Badge variant="secondary">{members.length}</Badge>
                    </div>
                    
                    {members.length > 0 ? (
                      <div className="space-y-2">
                        {members.map((member) => {
                          const RoleIcon = getRoleIcon(member.is_admin);
                          return (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">{member.name || 'No name'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <RoleIcon className="h-3 w-3" />
                                <span className="text-xs text-muted-foreground">
                                  {member.is_admin ? 'Admin' : 'Member'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
    </div>
  );
}