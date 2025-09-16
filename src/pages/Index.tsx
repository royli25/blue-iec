import ChatBot from "@/components/ChatBot";
import RotatingPanel from "@/components/RotatingPanel";
import HamburgerMenu from "@/components/HamburgerMenu";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index = () => {
  return (
    <div className="h-screen bg-background relative">
      <HamburgerMenu />
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50} minSize={30}>
          <ChatBot />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <RotatingPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
