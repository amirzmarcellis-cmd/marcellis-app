import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
interface Client {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}
export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  useEffect(() => {
    fetchClients();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client => client.name.toLowerCase().includes(searchQuery.toLowerCase()) || (client.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false));
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.from("clients").select("*").order("name");
      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to fetch clients");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    try {
      if (editingClient) {
        const {
          error
        } = await supabase.from("clients").update({
          name: formData.name,
          description: formData.description || null
        }).eq("id", editingClient.id);
        if (error) throw error;
        toast.success("Client updated successfully");
      } else {
        const {
          error
        } = await supabase.from("clients").insert({
          name: formData.name,
          description: formData.description || null
        });
        if (error) throw error;
        toast.success("Client added successfully");
      }
      setDialogOpen(false);
      setFormData({
        name: "",
        description: ""
      });
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Failed to save client");
    }
  };
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      description: client.description || ""
    });
    setDialogOpen(true);
  };
  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    try {
      const {
        error
      } = await supabase.from("clients").delete().eq("id", clientToDelete.id);
      if (error) throw error;
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client");
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({
        name: "",
        description: ""
      });
      setEditingClient(null);
    }
  };
  return <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Manage your client database
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="font-light">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-work">
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
              <DialogDescription className="font-light">
                {editingClient ? "Update client information" : "Add a new client to your database"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-light">
                  Client Name *
                </Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} placeholder="Enter client name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-light">
                  Description
                </Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} placeholder="Enter client description" rows={4} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)} className="font-light">
                  Cancel
                </Button>
                <Button type="submit" className="font-light">
                  {editingClient ? "Update" : "Add"} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search clients…" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="pl-10 h-11 border-border/60 bg-background/50 backdrop-blur-sm focus-visible:ring-primary/20" 
        />
      </div>

      {isLoading ? <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div> : filteredClients.length === 0 ? <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "No clients found" : "No clients yet"}
            </p>
          </CardContent>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredClients.map(client => <Card 
              key={client.id} 
              className="group relative h-[200px] flex flex-col transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base leading-tight line-clamp-1">
                        {client.name}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleEdit(client)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteClick(client)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 overflow-hidden">
                {client.description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {client.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">
                    No description provided
                  </p>
                )}
              </CardContent>
            </Card>)}
        </div>}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-work">Delete Client</AlertDialogTitle>
            <AlertDialogDescription className="font-light">
              Are you sure you want to delete "{clientToDelete?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-light">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 font-light">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}