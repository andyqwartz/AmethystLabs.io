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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  role: string;
  credits: number;
  created_at: string;
  last_login: string | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      loadUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400";
      case "moderator":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-purple-500/20 text-purple-400";
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
            <TableHead className="text-purple-300">Email</TableHead>
            <TableHead className="text-purple-300">Role</TableHead>
            <TableHead className="text-purple-300">Credits</TableHead>
            <TableHead className="text-purple-300">Joined</TableHead>
            <TableHead className="text-purple-300">Last Login</TableHead>
            <TableHead className="text-purple-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="text-white">{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-white">{user.credits}</TableCell>
              <TableCell className="text-white">
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-white">
                {user.last_login
                  ? new Date(user.last_login).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10"
                    >
                      Change Role
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1A1625] border-purple-300/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Change User Role
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-purple-200/60">
                        Select a new role for {user.email}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-3 gap-4 py-4">
                      {["user", "moderator", "admin"].map((role) => (
                        <Button
                          key={role}
                          onClick={() => {
                            updateUserRole(user.id, role);
                          }}
                          variant="outline"
                          className={`${getRoleBadgeColor(role)} capitalize`}
                          disabled={user.role === role}
                        >
                          {role}
                        </Button>
                      ))}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10">
                        Cancel
                      </AlertDialogCancel>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;
