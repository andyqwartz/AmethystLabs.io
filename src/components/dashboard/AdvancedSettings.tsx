import React from "react";
import { Button } from "../ui/button";
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
    seed?: number;
    hfLoras?: string[];
    loraScales?: number[];
    disableSafetyChecker?: boolean;
  };
  onChange: (key: string, value: any) => void;
}

const AdvancedSettings = ({ settings, onChange }: AdvancedSettingsProps) => {
  const handleLoraChange = (index: number, value: string) => {
    const newLoras = [...(settings.hfLoras || [])];
    newLoras[index] = value;
    onChange("hfLoras", newLoras);
  };

  const handleLoraScaleChange = (index: number, value: number) => {
    const newScales = [...(settings.loraScales || [])];
    newScales[index] = value;
    onChange("loraScales", newScales);
  };

  const addLora = () => {
    const newLoras = [...(settings.hfLoras || []), "AndyVampiro/fog"];
    const newScales = [...(settings.loraScales || []), 0.8];
    onChange("hfLoras", newLoras);
    onChange("loraScales", newScales);
  };

  const removeLora = (index: number) => {
    const newLoras = (settings.hfLoras || []).filter((_, i) => i !== index);
    const newScales = (settings.loraScales || []).filter((_, i) => i !== index);
    onChange("hfLoras", newLoras);
    onChange("loraScales", newScales);
  };

  return (
    <div className="space-y-6 p-6 bg-[#1A1625] rounded-xl border border-purple-300/20">
      <div className="space-y-2">
        <Label className="text-white">Aspect Ratio</Label>
        <Select
          value={settings.aspectRatio}
          onValueChange={(value) => onChange("aspectRatio", value)}
        >
          <SelectTrigger className="bg-[#13111C] border-purple-300/20 text-white">
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
        <div className="flex justify-between">
          <Label className="text-white">Prompt Strength</Label>
          <span className="text-white/60">{settings.promptStrength}</span>
        </div>
        <Slider
          value={[settings.promptStrength]}
          onValueChange={([value]) => onChange("promptStrength", value)}
          max={1}
          step={0.1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-white">Number of Outputs</Label>
          <span className="text-white/60">{settings.numOutputs}</span>
        </div>
        <Slider
          value={[settings.numOutputs]}
          onValueChange={([value]) => onChange("numOutputs", value)}
          min={1}
          max={4}
          step={1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-white">Inference Steps</Label>
          <span className="text-white/60">{settings.numInferenceSteps}</span>
        </div>
        <Slider
          value={[settings.numInferenceSteps]}
          onValueChange={([value]) => onChange("numInferenceSteps", value)}
          min={1}
          max={50}
          step={1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-white">Guidance Scale</Label>
          <span className="text-white/60">{settings.guidanceScale}</span>
        </div>
        <Slider
          value={[settings.guidanceScale]}
          onValueChange={([value]) => onChange("guidanceScale", value)}
          min={1}
          max={10}
          step={0.1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white">Output Format</Label>
        <Select
          value={settings.outputFormat}
          onValueChange={(value) => onChange("outputFormat", value)}
        >
          <SelectTrigger className="bg-[#13111C] border-purple-300/20 text-white">
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
        <div className="flex justify-between">
          <Label className="text-white">Output Quality</Label>
          <span className="text-white/60">{settings.outputQuality}%</span>
        </div>
        <Slider
          value={[settings.outputQuality]}
          onValueChange={([value]) => onChange("outputQuality", value)}
          min={1}
          max={100}
          step={1}
          className="py-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-white">Seed (optional)</Label>
          <span className="text-white/60">{settings.seed || "Random"}</span>
        </div>
        <Slider
          value={[settings.seed || 0]}
          onValueChange={([value]) => onChange("seed", value || undefined)}
          min={0}
          max={999999}
          step={1}
          className="py-2"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-white">LoRA Models</Label>
          <Button
            onClick={addLora}
            variant="outline"
            size="sm"
            className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/20"
          >
            Add LoRA
          </Button>
        </div>
        {(settings.hfLoras || []).map((lora, index) => (
          <div key={index} className="space-y-2">
            <div className="flex gap-2">
              <input
                value={lora}
                onChange={(e) => handleLoraChange(index, e.target.value)}
                className="flex-1 bg-[#13111C] border border-purple-300/20 rounded-md px-3 py-2 text-white placeholder-white/40"
                placeholder="LoRA URL or Huggingface path"
              />
              <Button
                onClick={() => removeLora(index)}
                variant="outline"
                size="sm"
                className="bg-[#13111C] border-purple-300/20 text-white hover:bg-purple-500/20"
              >
                Remove
              </Button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-sm text-white">Scale</Label>
                <span className="text-white/60">
                  {settings.loraScales?.[index] || 0.8}
                </span>
              </div>
              <Slider
                value={[settings.loraScales?.[index] || 0.8]}
                onValueChange={([value]) => handleLoraScaleChange(index, value)}
                max={1}
                step={0.1}
                className="py-2"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvancedSettings;
