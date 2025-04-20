
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProject } from "@/context/ProjectContext";
import { useWizard } from "@/context/WizardContext";

const ClientInfo: React.FC = () => {
  const { clientName, setClientName } = useProject();
  const { nextStep } = useWizard();
  const [localClientName, setLocalClientName] = useState(clientName);
  
  const handleSave = () => {
    setClientName(localClientName);
    nextStep();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name</Label>
        <Input
          id="clientName"
          placeholder="Enter client name"
          value={localClientName}
          onChange={(e) => setLocalClientName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <p className="text-sm text-muted-foreground">
          This name will appear on all reports and exports.
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save and Continue
        </Button>
      </div>
    </div>
  );
};

export default ClientInfo;
