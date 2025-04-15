
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectProvider } from "@/context/ProjectContext";
import ClientInfo from "@/components/ClientInfo";
import BoxManager from "@/components/BoxManager";
import ComplementaryProducts from "@/components/ComplementaryProducts";
import Summary from "@/components/Summary";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Smart Switch Counter</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ProjectProvider>
          <div className="space-y-6">
            <ClientInfo />
            
            <Tabs defaultValue="boxes" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="boxes">Box Configuration</TabsTrigger>
                <TabsTrigger value="complementary">Complementary Products</TabsTrigger>
                <TabsTrigger value="summary">Summary & Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="boxes" className="space-y-6">
                <BoxManager />
              </TabsContent>

              <TabsContent value="complementary" className="space-y-6">
                <ComplementaryProducts />
              </TabsContent>
              
              <TabsContent value="summary">
                <Summary />
              </TabsContent>
            </Tabs>
          </div>
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
