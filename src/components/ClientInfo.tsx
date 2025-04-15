
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProject } from "@/context/ProjectContext";

const ClientInfo: React.FC = () => {
  const { clientName, setClientName } = useProject();
  const [localClientName, setLocalClientName] = useState(clientName);

  const handleSave = () => {
    setClientName(localClientName);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
        <CardDescription>Enter the client details for this project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="clientName">Client Name</Label>
            <div className="flex gap-2">
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={localClientName}
                onChange={(e) => setLocalClientName(e.target.value)}
              />
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientInfo;
