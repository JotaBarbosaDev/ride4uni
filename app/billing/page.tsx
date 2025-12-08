import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";

export default function BillingPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-28">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>

        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              Billing
            </h1>
            <p className="text-muted-foreground">
              Define como queres pagar ou receber pelos teus rides: apenas Dinheiro ou MB Way.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Payment Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">Dinheiro</p>
                      <Badge variant="outline">Default</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Paga ou recebe em numerário no momento da viagem.
                    </p>
                    <Button variant="outline" className="w-full">
                      Definir como padrão
                    </Button>
                  </div>

                  <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">MB Way</p>
                      <Badge variant="outline">Disponível</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Usa o teu número MB Way para pagar ou receber instantaneamente.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Número MB Way</p>
                      <Input placeholder="+351 9xx xxx xxx" />
                    </div>
                    <Button variant="outline" className="w-full">
                      Guardar MB Way
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Notas</p>
                  <p className="text-sm text-muted-foreground">
                    Escolhe apenas entre Dinheiro ou MB Way. No momento não suportamos outros métodos de pagamento.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-primary/70 p-4">
                  <p className="text-2xl font-bold">Dinheiro</p>
                  <p className="text-sm mt-1">Método atual</p>
                </div>
                <div className="rounded-xl bg-primary/70 p-4">
                  <p className="text-xl font-semibold">MB Way</p>
                  <p className="text-sm mt-1">Configura para habilitar pagamentos instantâneos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
