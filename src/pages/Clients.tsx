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
      
      // Deduplicate clients by name (case-insensitive)
      const uniqueClients = (data || []).reduce((acc: Client[], current) => {
        const duplicate = acc.find(
          client => client.name.toLowerCase().trim() === current.name.toLowerCase().trim()
        );
        if (!duplicate) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setClients(uniqueClients);
      setFilteredClients(uniqueClients);
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
    
    // Check for duplicate client names (case-insensitive)
    const duplicateClient = clients.find(
      client => 
        client.name.toLowerCase().trim() === formData.name.toLowerCase().trim() &&
        client.id !== editingClient?.id
    );
    
    if (duplicateClient) {
      toast.error("A client with this name already exists");
      return;
    }
    
    try {
      if (editingClient) {
        const {
          error
        } = await supabase.from("clients").update({
          name: formData.name.trim(),
          description: formData.description?.trim() || null
        }).eq("id", editingClient.id);
        if (error) throw error;
        toast.success("Client updated successfully");
      } else {
        const {
          error
        } = await supabase.from("clients").insert({
          name: formData.name.trim(),
          description: formData.description?.trim() || null
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
  return <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            Manage your client database
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="shadow-sm text-sm w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:w-full max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-semibold">
                {editingClient ? "Edit Client" : "Add New Client"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {editingClient ? "Update client information" : "Add a new client to your database"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Client Name *
                </Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} placeholder="Enter client name" required className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} placeholder="Enter client description" rows={4} className="text-sm" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)} className="text-sm">
                  Cancel
                </Button>
                <Button type="submit" className="text-sm">
                  {editingClient ? "Update" : "Add"} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search clients…" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="pl-11 h-12 rounded-xl border-border/60 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20" 
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/60 shadow-sm">
          <div className="flex flex-col items-center justify-center py-20">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "No clients found" : "No clients yet"}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden">
          {filteredClients.map((client, index) => (
            <div 
              key={client.id}
              className={`
                group flex items-center justify-between gap-4 px-5 py-4
                transition-colors duration-150
                hover:bg-accent/50
                ${index !== filteredClients.length - 1 ? 'border-b border-border/40' : ''}
              `}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base text-foreground mb-0.5">
                    {client.name}
                  </h3>
                  {client.description ? (
                    <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                      {client.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50 italic">
                      No description
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 hover:bg-accent hover:text-foreground"
                  onClick={() => handleEdit(client)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteClick(client)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{clientToDelete?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}