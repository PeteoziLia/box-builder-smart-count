
import React from "react";
import { ProjectProvider } from "@/context/ProjectContext";
import { WizardProvider } from "@/context/WizardContext";
import Wizard from "@/components/Wizard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Smart Switch Counter</h1>
        </div>
      </header>
      
      <main>
        <ProjectProvider>
          <WizardProvider>
            <Wizard />
          </WizardProvider>
        </ProjectProvider>
      </main>
      
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Smart Switch Counter
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
