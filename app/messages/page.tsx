import {AppSidebar} from "@/components/app-sidebar";
import {MessagesInbox} from "@/components/messages-inbox";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";

export default function MessagesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-6">
        

        <div className="flex flex-col gap-8">
          <div className="space-y-2 text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              Messages
            </h1>
            <p className="text-muted-foreground">
              Chat with other students.
            </p>
          </div>

          <MessagesInbox className="max-w-5xl mx-auto min-h-screen md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


