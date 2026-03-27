import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, LogIn, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerArea() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-2 text-foreground hover:text-primary transition-colors">
          <User className="w-6 h-6" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Acesse sua conta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="nome@exemplo.com" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass" className="text-sm font-medium flex justify-between">
                Sua senha
                <a href="#" className="text-xs text-primary hover:underline">Esqueceu?</a>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input id="pass" type="password" placeholder="••••••••" className="pl-10" />
              </div>
            </div>
          </div>
          <Button className="w-full h-11 text-sm font-bold uppercase tracking-widest">
            Entrar
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Ainda não tem conta? <a href="#" className="text-primary font-bold hover:underline">Cadastre-se</a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
