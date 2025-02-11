import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface AdvancedSettingsProps {
  settings: {
    aspectRatio: string;
    promptStrength: number;
    numOutputs: number;
    numInferenceSteps: number;
    guidanceScale: number;
    outputFormat: string;
    outputQuality: number;
  };
  onChange: (key: string, value: any) => void;
}

const AdvancedSettings = ({ settings, onChange }: AdvancedSettingsProps) => {
  return (
    <div className="space-y-6 p-6 bg-[#1A1625] rounded-xl border border-purple-300/20">
      <div className="space-y-2">
        <Label className="text-purple-100">Aspect Ratio</Label>
        <Select
          value={settings.aspectRatio}
          onValueChange={(value) => onChange("aspectRatio", value)}
        >
          <SelectTrigger className="bg-[#13111C] border-purple-300/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              "1:1",
              "16:9",
              "21:9",
              "3:2",
              "2:3",
              "4:5",
              "5:4",
              "3:4",
              "4:3",
              "9:16",
              "9:21",
            ].map((ratio) => (
              <SelectItem key={ratio} value={ratio}>
                {ratio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-purple-100">Prompt Strength</Label>
        <Slider
          value={[settings.promptStrength]}
          onValueChange={([value]) => onChange("promptStrength", value)}
          max={1}
          step={0.1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-purple-100">Number of Outputs</Label>
        <Input
          type="number"
          min={1}
          max={4}
          value={settings.numOutputs}
          onChange={(e) => onChange("numOutputs", parseInt(e.target.value))}
          className="bg-[#13111C] border-purple-300/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-purple-100">Inference Steps</Label>
        <Input
          type="number"
          min={1}
          max={50}
          value={settings.numInferenceSteps}
          onChange={(e) =>
            onChange("numInferenceSteps", parseInt(e.target.value))
          }
          className="bg-[#13111C] border-purple-300/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-purple-100">Guidance Scale</Label>
        <Input
          type="number"
          min={1}
          max={10}
          step={0.1}
          value={settings.guidanceScale}
          onChange={(e) =>
            onChange("guidanceScale", parseFloat(e.target.value))
          }
          className="bg-[#13111C] border-purple-300/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-purple-100">Output Format</Label>
        <Select
          value={settings.outputFormat}
          onValueChange={(value) => onChange("outputFormat", value)}
        >
          <SelectTrigger className="bg-[#13111C] border-purple-300/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["webp", "jpg", "png"].map((format) => (
              <SelectItem key={format} value={format}>
                {format.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-purple-100">Output Quality</Label>
        <Input
          type="number"
          min={1}
          max={100}
          value={settings.outputQuality}
          onChange={(e) => onChange("outputQuality", parseInt(e.target.value))}
          className="bg-[#13111C] border-purple-300/20"
        />
      </div>
    </div>
  );
};

export default AdvancedSettings;
