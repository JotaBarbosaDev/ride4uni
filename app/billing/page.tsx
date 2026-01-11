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
              Choose how you want to pay or get paid for your rides: cash or MB Way.
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
                      <p className="text-lg font-semibold">Cash</p>
                      <Badge variant="outline">Default</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pay or get paid in cash at the time of the trip.
                    </p>
                    <Button variant="outline" className="w-full">
                      Set as default
                    </Button>
                  </div>

                  <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">MB Way</p>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Use your MB Way number to pay or get paid instantly.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">MB Way number</p>
                      <Input placeholder="+351 9xx xxx xxx" />
                    </div>
                    <Button variant="outline" className="w-full">
                      Save MB Way
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Notes</p>
                  <p className="text-sm text-muted-foreground">
                    Choose only between Cash or MB Way. We don&apos;t support other payment methods yet.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-primary/70 p-4">
                  <p className="text-2xl font-bold">Cash</p>
                  <p className="text-sm mt-1">Current method</p>
                </div>
                <div className="rounded-xl bg-primary/70 p-4">
                  <p className="text-xl font-semibold">MB Way</p>
                  <p className="text-sm mt-1">Set up to enable instant payments</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
