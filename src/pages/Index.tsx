const Index = () => {
  return (
    <div className="h-screen bg-background p-8">
      <div className="w-full h-full border-2 border-border bg-card">
        {/* Wireframe content area */}
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-96 h-64 border border-border bg-background mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted w-80 mx-auto"></div>
              <div className="h-4 bg-muted w-64 mx-auto"></div>
              <div className="h-4 bg-muted w-72 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
