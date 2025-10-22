import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { diffLines } from "./diffutil";

interface ChangePreviewDialogProps {
  open: boolean;
  beforeText: string;
  afterText: string;
  onApply: () => void;
  onCancel: () => void;
}

export default function ChangePreviewDialog({ open, beforeText, afterText, onApply, onCancel }: ChangePreviewDialogProps) {
  const parts = useMemo(() => diffLines(beforeText, afterText), [beforeText, afterText]);
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Proposed changes</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto rounded-md border border-border bg-white">
          <pre className="whitespace-pre-wrap text-[12px] p-3 leading-5">
            {parts.map((p, idx) => (
              <span key={idx} className={p.added ? 'text-green-700 bg-green-50' : p.removed ? 'text-red-700 bg-red-50 line-through' : ''}>{p.value}</span>
            ))}
          </pre>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button onClick={onApply}>Apply changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


