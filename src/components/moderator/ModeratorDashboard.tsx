import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentModeration from "../admin/ContentModeration";
import { Shield } from "lucide-react";

const ModeratorDashboard = () => {
  return (
    <div className="min-h-screen bg-[#13111C] pt-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <Card className="bg-[#1A1625] border-purple-300/20">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Moderator Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="bg-[#13111C] border-purple-300/20">
                <TabsTrigger
                  value="content"
                  className="text-white data-[state=active]:bg-purple-500/20"
                >
                  Content Moderation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <ContentModeration />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
