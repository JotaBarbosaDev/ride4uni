'use client';

import {FormEvent, useState} from "react";
import {format} from "date-fns";
import {Calendar as CalendarIcon, Clock, MapPin, Users, DollarSign} from "lucide-react";

import {AppSidebar} from "@/components/app-sidebar";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {createRide} from "@/api/ridesService";
import {getCurrentUser} from "@/api/authService";


type RideFormValues = {
  pickupLocation: string;
  dropoffLocation: string;
  date?: Date;
  time: string;
  seats: string;
  price: string;
};

export default function PostRidesPage() {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date || !time || !pickupLocation || !dropoffLocation || !seats) {
      alert("Preenche todos os campos obrigatórios");
      return;
    }
    try {
      setSubmitting(true);
      await PostRide({
        pickupLocation,
        dropoffLocation,
        date,
        time,
        seats,
        price,

      });
      setPickupLocation("");
      setDropoffLocation("");
      setDate(undefined);
      setTime("");
      setSeats("");
      setPrice("");
      alert("Boleia publicada");
    } catch (error) {
      console.error("Failed to post ride", error);
      alert("Failed to post ride");
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="space-y-2 text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              Post a Ride
            </h1>
            <p className="text-muted-foreground">
              Adiciona uma nova boleia num layout monocromático, alinhado com as outras páginas.
            </p>
          </div>

          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">Post a New Ride</CardTitle>
              <CardDescription>
                Preenche os detalhes da tua viagem e publica.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Pick-up Location
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                      <Input
                        value={pickupLocation}
                        onChange={(event) => setPickupLocation(event.target.value)}
                        placeholder="e.g., Location"
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Drop-off Location
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                      <Input
                        value={dropoffLocation}
                        onChange={(event) => setDropoffLocation(event.target.value)}
                        placeholder="e.g., Location"
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            data-empty={!date}
                            className="w-full justify-start border-0 bg-transparent px-0 text-left font-normal shadow-none hover:bg-transparent focus-visible:ring-0 data-[empty=true]:text-muted-foreground"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Time
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                      <Input
                        type="time"
                        step={60}
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Available Seats
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                      <Input
                        type="number"
                        min={1}
                        max={8}
                        value={seats}
                        onChange={(event) => setSeats(event.target.value)}
                        placeholder="1-8"
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      Price per Seat (€)
                    </p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-3">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="0.00"
                        className="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={submitting}>
                  {submitting ? "A publicar..." : "Post Ride"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export async function PostRide(ride: RideFormValues) {
  const toDateTime = (selectedDate?: Date, selectedTime?: string) => {
    if (!selectedDate || !selectedTime) return undefined;
    const [h, m] = selectedTime.split(":").map(Number);
    const combined = new Date(selectedDate);
    combined.setHours(h ?? 0, m ?? 0, 0, 0);
    return combined.toISOString();
  };

  const currentUser = await getCurrentUser();
  const currentUserId = currentUser.data?.id ?? currentUser.data;

  const payload = {
    origin: ride.pickupLocation,
    destination: ride.dropoffLocation,
    dateTime: toDateTime(ride.date, ride.time),
    seatCount: Number(ride.seats) || 0,
    availableSeats: Number(ride.seats) || 0,
    driverId: Number(currentUserId),
  };

try {
  await createRide(payload);
} catch (error: any) {
  console.error(error?.response?.data || error);
}
}
