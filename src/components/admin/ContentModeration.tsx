import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  generated_image: string;
  created_at: string;
  deleted_at: string | null;
  user_email?: string;
}

const ContentModeration = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGenerations();
  }, []);

  const loadGenerations = async () => {
    try {
      const { data, error } = await supabase
        .from("generations")
        .select(`*, profiles(email)`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data?.map((item) => ({
        ...item,
        user_email: item.profiles?.email,
      }));

      setGenerations(formattedData || []);
    } catch (error) {
      console.error("Error loading generations:", error);
      toast({
        title: "Error",
        description: "Failed to load generations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generations")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Generation deleted successfully",
      });

      loadGenerations();
    } catch (error) {
      console.error("Error deleting generation:", error);
      toast({
        title: "Error",
        description: "Failed to delete generation",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generations")
        .update({ deleted_at: null })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Generation restored successfully",
      });

      loadGenerations();
    } catch (error) {
      console.error("Error restoring generation:", error);
      toast({
        title: "Error",
        description: "Failed to restore generation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-purple-300">Image</TableHead>
            <TableHead className="text-purple-300">User</TableHead>
            <TableHead className="text-purple-300">Prompt</TableHead>
            <TableHead className="text-purple-300">Created</TableHead>
            <TableHead className="text-purple-300">Status</TableHead>
            <TableHead className="text-purple-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {generations.map((generation) => (
            <TableRow key={generation.id}>
              <TableCell>
                <img
                  src={generation.generated_image}
                  alt="Generated"
                  className="w-16 h-16 object-cover rounded-lg border border-purple-300/20"
                />
              </TableCell>
              <TableCell className="text-white">
                {generation.user_email}
              </TableCell>
              <TableCell className="text-white max-w-xs truncate">
                {generation.prompt}
              </TableCell>
              <TableCell className="text-white">
                {new Date(generation.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${generation.deleted_at ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
                >
                  {generation.deleted_at ? "Deleted" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    generation.deleted_at
                      ? handleRestore(generation.id)
                      : handleDelete(generation.id)
                  }
                  className={`${
                    generation.deleted_at
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                >
                  {generation.deleted_at ? "Restore" : "Delete"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentModeration;
