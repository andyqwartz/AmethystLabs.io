import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "./UserManagement";
import ContentModeration from "./ContentModeration";
import SystemLogs from "./SystemLogs";
import { Shield } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-[#13111C] pt-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <Card className="bg-[#1A1625] border-purple-300/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Admin Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList className="bg-[#13111C] border-purple-300/20">
                <TabsTrigger
                  value="users"
                  className="text-white data-[state=active]:bg-purple-500/20"
                >
                  User Management
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="text-white data-[state=active]:bg-purple-500/20"
                >
                  Content Moderation
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="text-white data-[state=active]:bg-purple-500/20"
                >
                  System Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <UserManagement />
              </TabsContent>

              <TabsContent value="content">
                <ContentModeration />
              </TabsContent>

              <TabsContent value="logs">
                <SystemLogs />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
