import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Download, Trash2, Wand2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

export interface Generation {
  id: string;
  prompt: string;
  generated_image: string;
  reference_image?: string;
  parameters: any;
  created_at: string;
}

interface GenerationHistoryProps {
  generations: Generation[];
  onDelete: (id: string) => void;
  onTweak: (generation: Generation) => void;
  onExport: () => void;
}

const GenerationHistory = ({
  generations,
  onDelete,
  onTweak,
  onExport,
}: GenerationHistoryProps) => {
  return (
    <Card className="bg-[#1A1625] border-purple-300/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <History className="w-5 h-5 text-purple-400" />
          Generation History
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="bg-[#13111C] border-purple-300/20 text-purple-100 hover:bg-purple-500/10"
          onClick={onExport}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {generations.map((generation) => (
            <div
              key={generation.id}
              className="p-4 bg-[#13111C] rounded-lg border border-purple-300/10 space-y-4"
            >
              <div className="flex gap-4">
                <img
                  src={generation.generated_image}
                  alt="Generated"
                  className="w-32 h-32 object-cover rounded-lg border border-purple-300/20"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-white/90 line-clamp-2">
                    {generation.prompt}
                  </p>
                  <p className="text-purple-200/60 text-sm">
                    {formatDistanceToNow(new Date(generation.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#13111C] border-purple-300/20 text-purple-100 hover:bg-purple-500/10"
                      onClick={() => onTweak(generation)}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Tweak
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-[#13111C] border-red-300/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1A1625] border-purple-300/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Delete Generation
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-purple-200/60">
                            Are you sure you want to delete this generation?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/10">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => onDelete(generation.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GenerationHistory;
