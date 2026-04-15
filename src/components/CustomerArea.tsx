import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, LogIn, Lock, Mail, UserPlus, LogOut, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export function CustomerArea() {
  const [view, setView] = useState<"login" | "signup" | "profile">("login");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setView("profile");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setView("profile");
      } else {
        setUser(null);
        setView("login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            }
          }
        });
        if (error) throw error;
        toast({ title: "Cadastro realizado!", description: "Verifique seu e-mail para confirmar a conta." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Erro na autenticação", 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Até logo!", description: "Você saiu da sua conta." });
  };

  if (view === "profile" && user) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="p-2 text-white hover:text-primary transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black uppercase text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              <User className="w-6 h-6 text-primary" />
              Sua Conta
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Nome</p>
              <p className="font-bold text-[#0a1e36]">{user.user_metadata?.full_name || "Não informado"}</p>
              <div className="h-px bg-slate-200 my-4" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">E-mail</p>
              <p className="font-bold text-[#0a1e36]">{user.email}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-12 border-slate-200 font-bold uppercase tracking-widest text-[10px]" asChild>
                <a href="/rastreio">Meus Pedidos</a>
              </Button>
              {user.email === "admin@automatiza.com" && (
                <Button variant="default" className="h-12 bg-[#0a1e36] hover:bg-[#0a1e36]/90 font-bold uppercase tracking-widest text-[10px]" asChild>
                  <a href="/admin">Painel Admin</a>
                </Button>
              )}
              <Button onClick={handleLogout} variant="destructive" className="h-12 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 col-span-2">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 text-white hover:text-primary transition-colors">
          <User className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black uppercase text-[#0a1e36]" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {view === "login" ? <LogIn className="w-6 h-6 text-primary" /> : <UserPlus className="w-6 h-6 text-primary" />}
            {view === "login" ? "Acesse sua conta" : "Crie sua conta"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAuth} className="space-y-6 pt-6">
          <div className="space-y-4">
            {view === "signup" && (
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    required={view === "signup"}
                    placeholder="Seu nome"
                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm font-bold" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  required
                  type="email" 
                  placeholder="nome@exemplo.com" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Sua senha</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  required
                  type="password" 
                  placeholder="••••••••" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-sm font-bold"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
          </div>

          <Button disabled={loading} className="w-full h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl bg-primary hover:shadow-xl hover:shadow-primary/20 shadow-lg transition-all">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (view === "login" ? "Entrar na Loja" : "Finalizar Cadastro")}
          </Button>

          <div className="text-center text-sm font-medium">
            {view === "login" ? (
              <p className="text-slate-500">
                Ainda não tem conta?{" "}
                <button type="button" onClick={() => setView("signup")} className="text-primary font-black hover:underline ml-1">
                  Cadastre-se
                </button>
              </p>
            ) : (
              <button type="button" onClick={() => setView("login")} className="flex items-center gap-2 text-slate-400 hover:text-primary mx-auto transition-colors font-bold text-xs uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Login
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
