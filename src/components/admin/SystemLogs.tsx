import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface Log {
  id: string;
  user_id: string;
  type: string;
  metadata: any;
  created_at: string;
  user_email?: string;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data: creditLogs, error: creditError } = await supabase
        .from("credit_transactions")
        .select(`*, profiles(email)`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (creditError) throw creditError;

      const formattedLogs = creditLogs?.map((log) => ({
        ...log,
        user_email: log.profiles?.email,
      }));

      setLogs(formattedLogs || []);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast({
        title: "Error",
        description: "Failed to load system logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case "generation":
        return "bg-purple-500/20 text-purple-400";
      case "purchase":
        return "bg-green-500/20 text-green-400";
      case "refund":
        return "bg-yellow-500/20 text-yellow-400";
      case "ad_watch":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-gray-500/20 text-gray-400";
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
            <TableHead className="text-purple-300">Time</TableHead>
            <TableHead className="text-purple-300">User</TableHead>
            <TableHead className="text-purple-300">Type</TableHead>
            <TableHead className="text-purple-300">Amount</TableHead>
            <TableHead className="text-purple-300">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-white">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-white">{log.user_email}</TableCell>
              <TableCell>
                <Badge className={getLogTypeColor(log.type)}>{log.type}</Badge>
              </TableCell>
              <TableCell
                className={`font-medium ${log.amount > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {log.amount > 0 ? "+" : ""}
                {log.amount}
              </TableCell>
              <TableCell className="text-white max-w-xs truncate">
                {JSON.stringify(log.metadata)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SystemLogs;
