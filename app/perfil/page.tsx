import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {LucideStar} from "lucide-react";

export default function PerfilPage() {
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
              Profile
            </h1>
            <p className="text-muted-foreground">
              Review your info and stats in a monochrome interface.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <Avatar className="h-24 w-24 rounded-full bg-primary text-primary-foreground text-3xl">
                    <AvatarImage src="/" alt="user" />
                    <AvatarFallback className="text-3xl">U</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                      <p className="text-xl font-semibold">User</p>
                      <Badge variant="outline" className="w-max">Verified Student</Badge>
                    </div>
                    <p className="text-muted-foreground">user@university.edu</p>
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <LucideStar className="h-4 w-4" />
                      <span>4.9 Rating</span>
                    </div>
                    <Button variant="outline" className="w-max">Edit Profile</Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Student ID</p>
                    <Input value="2024001" disabled className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-muted-foreground">Phone Number</p>
                    <Input value="+1 (555) 123-4567" disabled className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-primary/70 p-4">
                  <p className="text-4xl font-bold">24</p>
                  <p className="text-sm mt-1">Total Rides</p>
                </div>
                <div className="rounded-xl bg-primary/70 p-4">
                  <p className="text-4xl font-bold">€287</p>
                  <p className="text-sm mt-1">Money Saved</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
