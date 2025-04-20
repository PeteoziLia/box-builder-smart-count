
import React from "react";
import { useWizard } from "@/context/WizardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ClientInfo from "@/components/WizardSteps/ClientInfo";
import DefaultSelection from "@/components/WizardSteps/DefaultSelection";
import CreateBox from "@/components/WizardSteps/CreateBox";
import AddProducts from "@/components/WizardSteps/AddProducts";
import AddComplementary from "@/components/WizardSteps/AddComplementary";
import Review from "@/components/WizardSteps/Review";

const Wizard: React.FC = () => {
  const { currentStep, nextStep, prevStep, canGoNext, canGoPrev } = useWizard();
  
  const renderStepContent = () => {
    switch (currentStep) {
      case "client-info":
        return <ClientInfo />;
      case "default-selection":
        return <DefaultSelection />;
      case "create-box":
        return <CreateBox />;
      case "add-products":
        return <AddProducts />;
      case "add-complementary":
        return <AddComplementary />;
      case "review":
        return <Review />;
      default:
        return <div>Unknown step</div>;
    }
  };
  
  const getStepTitle = () => {
    switch (currentStep) {
      case "client-info":
        return "Client Information";
      case "default-selection":
        return "Default Selection";
      case "create-box":
        return "Create Box";
      case "add-products":
        return "Add Products to Box";
      case "add-complementary":
        return "Add Complementary Products";
      case "review":
        return "Review and Export";
      default:
        return "Unknown Step";
    }
  };
  
  const getStepNumber = () => {
    switch (currentStep) {
      case "client-info":
        return "1";
      case "default-selection":
        return "2";
      case "create-box":
        return "3";
      case "add-products":
        return "4";
      case "add-complementary":
        return "5";
      case "review":
        return "6";
      default:
        return "";
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader className="border-b">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold mr-3">
                {getStepNumber()}
              </div>
              <CardTitle>{getStepTitle()}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={!canGoPrev}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep !== "review" ? (
              <Button
                onClick={nextStep}
                disabled={!canGoNext}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Finish
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Wizard;
