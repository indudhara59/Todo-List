import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Plus, Trash2, CheckCircle2, Tag, Filter, ChevronDown, Calendar, AlertCircle, Clock, PieChart as PieChartIcon, Edit2, Settings } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

type Todo = {
  todo_id: string;
  title: string;
  description: string | null;
  status: boolean;
  created_at: string;
  category: string;
  due_date: string | null;
};

const CATEGORIES = ["Other", "Personal", "Work", "Shopping", "Food & Expense", "Health"];

export default function Todos({ session, setSession }: { session: { userId: string; username: string }; setSession: (session: null) => void }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [newDueDate, setNewDueDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const timeoutRefs = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteAccount = async () => {
    setLoading(true);
    await supabase.from('Todos').delete().eq('user_id', session.userId);
    const { error } = await supabase.from('Users').delete().eq('user_id', session.userId);
    if (!error) {
       setSession(null);
    }
    setLoading(false);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("Other");
  const [editDueDate, setEditDueDate] = useState("");

  const saveEdit = async (todo: Todo) => {
    if (!editTitle.trim()) return;
    setLoading(true);
    const finalDueDate = editDueDate ? new Date(editDueDate).toISOString() : null;
    const { error } = await supabase
      .from('Todos')
      .update({ title: editTitle, description: editDesc, category: editCategory, due_date: finalDueDate })
      .eq('todo_id', todo.todo_id);
    
    if (!error) {
      setTodos(todos.map(t => t.todo_id === todo.todo_id ? 
        { ...t, title: editTitle, description: editDesc, category: editCategory, due_date: finalDueDate } : t
      ));
      setEditingId(null);
    }
    setLoading(false);
  };

  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: todos.filter(t => t.category === cat).length
  })).filter(c => c.value > 0);

  const COLORS = ['#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#0ea5e9', '#10b981', '#14b8a6', '#06b6d4'];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};

    todos.forEach((todo) => {
      if (todo.due_date && !todo.status) {
        const dueDate = new Date(todo.due_date);
        const fiveMinutesInMs = 5 * 60 * 1000;
        const notificationTime = dueDate.getTime() - fiveMinutesInMs;
        const timeMs = notificationTime - now.getTime();
        
        if (timeMs > 0 && timeMs <= 2147483647) {
          timeoutRefs.current[todo.todo_id] = setTimeout(() => {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Due in 5 Minutes: ${todo.title}`, {
                body: todo.description || "Your task is due in 5 minutes! Get ready."
              });
            }
          }, timeMs);
        }
      }
    });

    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, [todos]);

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

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setLoading(true);
    const finalDueDate = newDueDate ? new Date(newDueDate).toISOString() : null;

    const { data, error } = await supabase
      .from('Todos')
      .insert([{ user_id: session.userId, title: newTitle, description: newDesc, category: newCategory, due_date: finalDueDate }])
      .select();

    if (!error && data) {
      setTodos([data[0], ...todos]);
      setNewTitle("");
      setNewDesc("");
      setNewCategory("Other");
      setNewDueDate("");
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
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full z-10 relative overflow-hidden">
      <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="flex items-center justify-between mb-8 glass rounded-2xl p-4 shadow-lg border-border border"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">DoIt</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Hello, <strong className="text-foreground">{session.username}</strong></span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-border shadow-2xl min-w-[160px]">
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-foreground py-2 font-medium">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteConfirm(true)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive py-2 font-medium">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>

      <div className="grid md:grid-cols-[300px_1fr] gap-6 flex-1 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 100 }}
          className="flex flex-col gap-6 sticky top-4"
        >
          <Card className="glass">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background/40 font-normal border-input">
                      {newCategory}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] glass border-border shadow-xl">
                    {CATEGORIES.map(cat => (
                      <DropdownMenuItem key={cat} onSelect={() => setNewCategory(cat)} className="cursor-pointer">
                        {cat}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" type="button" className={`w-full justify-start text-left font-normal bg-background/40 border-input ${!newDueDate && "text-muted-foreground"}`}>
                      <Calendar className="mr-2 h-4 w-4 opacity-50" />
                      {newDueDate ? new Date(newDueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "Set due date & time (optional)"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] glass border-border shadow-xl p-3 flex flex-col gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Date</label>
                      <Input 
                        type="date"
                        value={newDueDate.includes('T') ? newDueDate.split('T')[0] : (newDueDate || "")}
                        onChange={(e) => {
                           const newDate = e.target.value;
                           if (!newDate) { setNewDueDate(""); return; }
                           const time = newDueDate.includes('T') ? newDueDate.split('T')[1] : "12:00";
                           setNewDueDate(`${newDate}T${time}`);
                        }}
                        className="h-8 bg-background/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Time</label>
                      <Input 
                        type="time"
                        value={newDueDate.includes('T') ? newDueDate.split('T')[1] : "12:00"}
                        onChange={(e) => {
                           const newTime = e.target.value;
                           const date = newDueDate.includes('T') ? newDueDate.split('T')[0] : new Date().toISOString().split('T')[0];
                           setNewDueDate(`${date}T${newTime}`);
                        }}
                        className="h-8 bg-background/50"
                      />
                    </div>
                    {newDueDate && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setNewDueDate("")} className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 mt-1">
                        Clear Date
                      </Button>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}>
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    <Plus className="w-4 h-4" />
                    Add Task
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
          
          <AnimatePresence>
            {todos.length > 0 && categoryData.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, height: 0, overflow: "hidden" }} transition={{ delay: 0.1, duration: 0.3 }}>
                <Card className="glass sticky top-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold tracking-tight flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-primary" />
                      Category Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px] flex items-center justify-center p-0 pb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="opacity-90 hover:opacity-100 transition-opacity drop-shadow-md" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", backgroundColor: "hsl(var(--background)/0.8)", backdropFilter: "blur(12px)", color: "hsl(var(--foreground))" }} 
                          itemStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 }}
          className="space-y-4 mt-2 md:mt-0"
        >
          <div className="flex items-center justify-between glass rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="w-4 h-4 text-muted-foreground" />
              Filter by Category
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-background/40 font-normal gap-2 border-input whitespace-nowrap min-w-[140px] justify-between">
                  {filterCategory === "All" ? "All Categories" : filterCategory}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-border shadow-xl min-w-[140px]">
                <DropdownMenuItem onSelect={() => setFilterCategory("All")} className="cursor-pointer">
                  All Categories
                </DropdownMenuItem>
                {CATEGORIES.map(cat => (
                  <DropdownMenuItem key={cat} onSelect={() => setFilterCategory(cat)} className="cursor-pointer">
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <AnimatePresence mode="wait">
            {todos.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center justify-center p-12 text-center glass rounded-2xl border-border border h-64">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No tasks yet</h3>
                <p className="text-muted-foreground text-sm">Add a task to get started on your journey.</p>
              </motion.div>
            ) : (
              <motion.div key="task-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8">
                {(() => {
                  const filtered = todos.filter(t => filterCategory === "All" || t.category === filterCategory);
                  const overdueTodos = filtered.filter(t => t.due_date && new Date(t.due_date) < currentTime && !t.status);
                  const regularTodos = filtered.filter(t => !(t.due_date && new Date(t.due_date) < currentTime && !t.status));

                  const renderTodo = (todo: Todo) => {
                    const isOverdue = todo.due_date && new Date(todo.due_date) < currentTime && !todo.status;
                    const isEditing = editingId === todo.todo_id;

                    if (isEditing) {
                      return (
                        <motion.div 
                          layout 
                          initial={{ opacity: 0, scale: 0.95 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0, overflow: 'hidden' }} 
                          transition={{ duration: 0.2 }}
                          key={`edit-${todo.todo_id}`} 
                          className="p-4 glass rounded-xl border border-primary/50 transition-colors flex flex-col gap-3 relative z-20"
                        >
                          <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-background/40 font-medium" placeholder="Task Title" />
                          <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="bg-background/40 text-sm" placeholder="Task Details (optional)" />
                          
                          <div className="flex flex-wrap gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="bg-background/40 h-9 font-normal border-input text-xs shrink-0">
                                  {editCategory}
                                  <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="glass shadow-xl">
                                {CATEGORIES.map(cat => (
                                  <DropdownMenuItem key={cat} onSelect={() => setEditCategory(cat)} className="cursor-pointer text-xs">{cat}</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" type="button" className={`h-9 font-normal bg-background/40 border-input text-xs shrink-0 ${!editDueDate && "text-muted-foreground"}`}>
                                  <Calendar className="mr-2 h-3 w-3 opacity-50" />
                                  {editDueDate ? new Date(editDueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : "Set due date & time"}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="glass border-border shadow-xl p-3 flex flex-col gap-3 w-64">
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                                  <Input 
                                    type="date"
                                    value={editDueDate.includes('T') ? editDueDate.split('T')[0] : (editDueDate || "")}
                                    onChange={(e) => {
                                       const newDate = e.target.value;
                                       if (!newDate) { setEditDueDate(""); return; }
                                       const time = editDueDate.includes('T') ? editDueDate.split('T')[1] : "12:00";
                                       setEditDueDate(`${newDate}T${time}`);
                                    }}
                                    className="h-8 bg-background/50 text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground">Time</label>
                                  <Input 
                                    type="time"
                                    value={editDueDate.includes('T') ? editDueDate.split('T')[1] : "12:00"}
                                    onChange={(e) => {
                                       const newTime = e.target.value;
                                       const date = editDueDate.includes('T') ? editDueDate.split('T')[0] : new Date().toISOString().split('T')[0];
                                       setEditDueDate(`${date}T${newTime}`);
                                    }}
                                    className="h-8 bg-background/50 text-xs"
                                  />
                                </div>
                                {editDueDate && (
                                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditDueDate("")} className="h-8 text-destructive text-xs hover:bg-destructive/10 mt-1">
                                    Clear Date
                                  </Button>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-end gap-2 mt-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="h-8 text-xs hover:bg-muted/50">Cancel</Button>
                            <Button size="sm" onClick={() => saveEdit(todo)} disabled={loading} className="h-8 text-xs">Save Changes</Button>
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div 
                        layout 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9, height: 0, margin: 0, overflow: 'hidden' }} 
                        transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }} 
                        key={todo.todo_id} 
                        className={`group flex items-start gap-3 p-4 glass rounded-xl border transition-colors duration-500 overflow-hidden ${
                          todo.status ? 'bg-background/20 opacity-70 border-border' : isOverdue ? 'bg-destructive/10 border-destructive/40 hover:border-destructive/60' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="pt-0.5 min-w-[20px]">
                          <Checkbox 
                            checked={todo.status}
                            onCheckedChange={() => toggleTodo(todo.todo_id, todo.status)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className={`font-medium text-[15px] truncate transition-all duration-200 ${todo.status ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {todo.title}
                            </h4>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary border border-primary/20">
                              <Tag className="w-3 h-3 mr-1" />
                              {todo.category || 'Other'}
                            </span>
                            {todo.due_date && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border transition-colors duration-500 ${
                                isOverdue 
                                  ? 'bg-destructive/20 text-destructive border-destructive/30' 
                                  : 'bg-muted/50 text-muted-foreground border-border'
                              }`}>
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(todo.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            )}
                          </div>
                          {todo.description && (
                            <p className={`text-sm mt-1 mb-0.5 line-clamp-2 transition-all ${todo.status ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'}`}>
                              {todo.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            type="button"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 h-8 w-8"
                            onClick={() => {
                              setEditingId(todo.todo_id);
                              setEditTitle(todo.title);
                              setEditDesc(todo.description || "");
                              setEditCategory(todo.category || "Other");
                              if (todo.due_date) {
                                const d = new Date(todo.due_date);
                                const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                                setEditDueDate(localIso);
                              } else {
                                setEditDueDate("");
                              }
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            type="button"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
                            onClick={() => deleteTodo(todo.todo_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  };

                  return (
                    <AnimatePresence mode="popLayout">
                      {overdueTodos.length > 0 && (
                        <motion.div layout key="overdue-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} className="space-y-3">
                          <h3 className="text-xs font-bold text-destructive flex items-center gap-2 uppercase tracking-widest ml-1">
                            <AlertCircle className="w-4 h-4" /> Overdue Tasks
                          </h3>
                          <div className="grid gap-3">
                            <AnimatePresence mode="popLayout">
                              {overdueTodos.map(renderTodo)}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}

                      {regularTodos.length > 0 && (
                        <motion.div layout key="regular-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} className="space-y-3">
                          <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest ml-1">
                            <Clock className="w-4 h-4" /> Current Tasks
                          </h3>
                          <div className="grid gap-3">
                            <AnimatePresence mode="popLayout">
                              {regularTodos.map(renderTodo)}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                      
                      {filtered.length === 0 && todos.length > 0 && (
                        <motion.div layout key="no-filter-match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-8 text-muted-foreground text-sm glass rounded-xl border border-border">
                          No tasks match the selected filter.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass p-6 rounded-2xl max-w-sm w-full border border-destructive/20 shadow-2xl flex flex-col items-center text-center relative z-[101]"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-destructive mb-2 tracking-tight">Delete Account?</h3>
              <p className="text-sm text-foreground/80 mb-6 font-medium">
                Are you absolutely sure? This action is permanent and cannot be undone. All your tasks will be permanently erased.
              </p>
              <div className="flex w-full gap-3 justify-center">
                 <Button variant="outline" className="flex-1 bg-background/50 border-input" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                 <Button variant="destructive" className="flex-1" onClick={deleteAccount} disabled={loading}>
                   {loading ? "Deleting..." : "Yes, Delete"}
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
