import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogOut, Plus, Trash2, CheckCircle2 } from "lucide-react";

type Todo = {
  todo_id: string;
  title: string;
  description: string | null;
  status: boolean;
  created_at: string;
};

export default function Todos({ session, setSession }: { session: { userId: string; username: string }; setSession: (session: null) => void }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('Todos')
        .select('*')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setTodos(data);
      }
    };

    fetchTodos();
  }, [session.userId]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('Todos')
      .insert([{ user_id: session.userId, title: newTitle, description: newDesc }])
      .select();

    if (!error && data) {
      setTodos([data[0], ...todos]);
      setNewTitle("");
      setNewDesc("");
    }
    setLoading(false);
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('Todos')
      .update({ status: !currentStatus })
      .eq('todo_id', id);

    if (!error) {
      setTodos(todos.map(t => t.todo_id === id ? { ...t, status: !currentStatus } : t));
    }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('Todos')
      .delete()
      .eq('todo_id', id);

    if (!error) {
      setTodos(todos.filter(t => t.todo_id !== id));
    }
  };

  const logout = () => {
    setSession(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full z-10 relative">
      <header className="flex items-center justify-between mb-8 glass rounded-2xl p-4 shadow-lg border-border border">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">DoIt</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Hello, <strong className="text-foreground">{session.username}</strong></span>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="grid md:grid-cols-[300px_1fr] gap-6 flex-1">
        <div>
          <Card className="glass sticky top-4">
            <CardHeader>
              <CardTitle>New Task</CardTitle>
              <CardDescription>What needs to be done?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={addTodo} className="space-y-4">
                <Input 
                  placeholder="Task title..." 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-background/40"
                  required
                />
                <Input 
                  placeholder="Details (optional)" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-background/40 text-sm"
                />
                <Button type="submit" className="w-full gap-2 transition-transform active:scale-95" disabled={loading}>
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center glass rounded-2xl border-border border h-64">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No tasks yet</h3>
              <p className="text-muted-foreground text-sm">Add a task to get started on your journey.</p>
            </div>
          ) : (
            <div className="grid gap-3 transition-all duration-300">
              {todos.map(todo => (
                <div key={todo.todo_id} className={`group flex items-start gap-3 p-4 glass rounded-xl border border-border transition-all duration-300 hover:border-primary/50 ${todo.status ? 'bg-background/20 opacity-70' : ''}`}>
                  <div className="pt-0.5">
                    <Checkbox 
                      checked={todo.status}
                      onCheckedChange={() => toggleTodo(todo.todo_id, todo.status)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-[15px] truncate transition-all duration-200 ${todo.status ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className={`text-sm mt-1 mb-0.5 line-clamp-2 transition-all ${todo.status ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'}`}>
                        {todo.description}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteTodo(todo.todo_id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
