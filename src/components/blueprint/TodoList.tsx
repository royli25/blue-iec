import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

type Todo = {
  id: string;
  title: string;
  status: "todo" | "done";
  position: number;
};

interface TodoListProps {
  className?: string;
}

export default function TodoList({ className }: TodoListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("personal_blueprint_todos")
        .select("id,title,status,position")
        .eq("user_id", user.id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      setLoading(false);
      if (error) {
        toast({ title: "Failed to load todos", description: error.message, variant: "destructive" });
      } else {
        setItems((data as any) ?? []);
      }
    })();
  }, [user]);

  const nextPosition = useMemo(() => (items.length ? Math.max(...items.map(i => i.position)) + 1 : 0), [items]);

  const addTodo = async () => {
    const title = newTitle.trim();
    if (!title || !user) return;
    setNewTitle("");
    const optimistic: Todo = { id: `tmp-${Date.now()}`, title, status: "todo", position: nextPosition };
    setItems(prev => [...prev, optimistic]);
    const { data, error } = await supabase.from("personal_blueprint_todos").insert({ user_id: user.id, title, status: "todo", position: nextPosition }).select("id,title,status,position").single();
    if (error) {
      toast({ title: "Add failed", description: error.message, variant: "destructive" });
      setItems(prev => prev.filter(i => i.id !== optimistic.id));
    } else {
      setItems(prev => prev.map(i => (i.id === optimistic.id ? (data as any) : i)));
    }
  };

  const toggleStatus = async (todo: Todo) => {
    const updated: Todo = { ...todo, status: todo.status === "todo" ? "done" : "todo" };
    setItems(prev => prev.map(i => (i.id === todo.id ? updated : i)));
    const { error } = await supabase.from("personal_blueprint_todos").update({ status: updated.status }).eq("id", todo.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      setItems(prev => prev.map(i => (i.id === todo.id ? todo : i)));
    }
  };

  const updateTitle = async (todo: Todo, title: string) => {
    const trimmed = title.trim();
    const updated: Todo = { ...todo, title: trimmed };
    setItems(prev => prev.map(i => (i.id === todo.id ? updated : i)));
    const { error } = await supabase.from("personal_blueprint_todos").update({ title: trimmed }).eq("id", todo.id);
    if (error) {
      toast({ title: "Rename failed", description: error.message, variant: "destructive" });
      setItems(prev => prev.map(i => (i.id === todo.id ? todo : i)));
    }
  };

  const remove = async (todo: Todo) => {
    const prev = items;
    setItems(prev.filter(i => i.id !== todo.id));
    const { error } = await supabase.from("personal_blueprint_todos").delete().eq("id", todo.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      setItems(prev);
    }
  };

  return (
    <div className={"flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden " + (className ?? "") }>
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="text-sm font-medium">Todos</div>
        <div className="mt-2 flex gap-2">
          <Input placeholder="New todo" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addTodo(); }} />
          <Button onClick={addTodo} disabled={!newTitle.trim()}>Add</Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="text-xs text-foreground/60 px-2 py-1">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-xs text-foreground/60 px-2 py-1">Add your first task</div>
        ) : (
          <ul className="space-y-1">
            {items.map(t => (
              <li key={t.id} className="flex items-center gap-2 p-2 rounded border border-border bg-card">
                <Checkbox checked={t.status === 'done'} onCheckedChange={() => toggleStatus(t)} />
                <input
                  className="flex-1 bg-transparent outline-none text-sm line-clamp-1"
                  value={t.title}
                  onChange={e => updateTitle(t, e.target.value)}
                />
                <Button variant="ghost" size="sm" onClick={() => remove(t)}>Delete</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


