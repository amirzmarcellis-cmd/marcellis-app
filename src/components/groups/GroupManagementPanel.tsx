import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GroupDialog } from "./GroupDialog";

interface Group {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

interface GroupWithJobCount extends Group {
  job_count: number;
}

export function GroupManagementPanel() {
  const [groups, setGroups] = useState<GroupWithJobCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchGroupsWithJobCount();
  }, []);

  const fetchGroupsWithJobCount = async () => {
    try {
      // First get all groups
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .order('name');

      if (groupsError) throw groupsError;

      // Then get job counts for each group
      const groupsWithCounts = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('Jobs')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          return {
            ...group,
            job_count: count || 0,
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}"? Jobs in this group will be ungrouped.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
      
      await fetchGroupsWithJobCount();
      toast.success("Group deleted successfully");
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error("Failed to delete group");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-glow">Group Management</h2>
          <p className="text-muted-foreground">Organize jobs into groups for better management</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedGroup(null);
            setIsDialogOpen(true);
          }}
          className="action-button bg-gradient-primary hover:shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="mission-card">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups found</h3>
              <p className="text-muted-foreground mb-4">Create your first group to organize your jobs</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id} className="mission-card group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color || "#3B82F6" }}
                      />
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {group.name}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.job_count} {group.job_count === 1 ? 'job' : 'jobs'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedGroup(group);
                        setIsDialogOpen(true);
                      }}
                      className="h-8 px-2"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(group.id, group.name)}
                      className="h-8 px-2 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(group.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GroupDialog
        group={selectedGroup}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedGroup(null);
          }
        }}
        onSave={() => {
          fetchGroupsWithJobCount();
          setIsDialogOpen(false);
          setSelectedGroup(null);
        }}
      />
    </div>
  );
}