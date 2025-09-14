import ChatBot from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-4xl h-full max-h-[600px] bg-card border border-border rounded-lg shadow-lg">
        <ChatBot />
      </div>
    </div>
  );
};

export default Index;
