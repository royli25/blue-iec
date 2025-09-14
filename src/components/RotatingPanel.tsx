import { useState, useEffect } from "react";

const RotatingPanel = () => {
  const [currentPanel, setCurrentPanel] = useState(0);
  
  const panels = [
    {
      title: "Panel One",
      content: "This is the first rotating panel with some content to demonstrate the vertical rotation effect.",
    },
    {
      title: "Panel Two", 
      content: "Second panel showing different information with a clean black and white design approach.",
    },
    {
      title: "Panel Three",
      content: "Third panel completing the rotation cycle before returning to the first panel automatically.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPanel((prev) => (prev + 1) % panels.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [panels.length]);

  return (
    <div className="relative h-full overflow-hidden bg-background">
      <div className="absolute inset-0 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-foreground">Rotating Content</h2>
        </div>

        {/* Rotating Content */}
        <div className="relative flex-1 overflow-hidden">
          {panels.map((panel, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center p-8 transition-transform duration-1000 ease-in-out ${
                index === currentPanel
                  ? "translate-y-0 opacity-100"
                  : index < currentPanel
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0"
              }`}
            >
              <div className="text-center max-w-md">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  {panel.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {panel.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Panel Indicators */}
        <div className="flex justify-center gap-2 p-4 border-t border-border">
          {panels.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPanel(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentPanel
                  ? "bg-foreground"
                  : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RotatingPanel;