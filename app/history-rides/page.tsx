"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {LucideStar, Trash2, MessageCircle} from "lucide-react";
import {AppSidebar} from "@/components/app-sidebar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getCurrentUser} from "@/api/authService";
import {getBookingsByPassengerID, deleteBooking} from "@/api/bookingService";
import {getRideByRideID, getRidesByDriver, deleteRide, updateRide} from "@/api/ridesService";
import {getUserByID} from "@/api/userService";
import {createChat, getUserChats} from "@/api/chatService";
import {createRating} from "@/api/ratingService";
import {showAlert} from "@/components/alert-toaster";

type Ride = {
  id: number;
  origin: string;
  destination: string;
  dateTime: string;
  seatCount: number;
  availableSeats: number;
  driverId: number;
  status?: string;
  ratings?: Array<{userPassengerId?: string | number; rating?: number}>;
};

type BookingWithRide = {
  ride: Ride;
  driverName?: string;
  passengerId: number;
};

type Booking = {
  rideId: number;
  passengerId: number;
};

type ChatApi = {
  id?: string;
  participants?: Array<string | number>;
};

type CreateRatingPayload = {
  userDriverId: number;
  userPassengerId: number;
  rating: number;
  rideId: number;
};

export default function HistoryRidesPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithRide[]>([]);
  const [postedRides, setPostedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"passenger" | "driver">("passenger");
  const [workingBooking, setWorkingBooking] = useState<string | null>(null);
  const [workingRide, setWorkingRide] = useState<number | null>(null);
  const [completingRide, setCompletingRide] = useState<number | null>(null);
  const [ratingRideId, setRatingRideId] = useState<number | null>(null);
  const [hoveredRideId, setHoveredRideId] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [openingChatFor, setOpeningChatFor] = useState<string | null>(null);
  const [confirmDeleteRideId, setConfirmDeleteRideId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await getCurrentUser();
        const meId = meRes.data?.id ?? meRes.data;
        if (!meId) return;
        const normalizedMeId = typeof meId === "string" ? Number(meId) : meId;
        setCurrentUserId(Number.isFinite(normalizedMeId) ? normalizedMeId : null);

        const [bookingsRes, driverRidesRes] = await Promise.all([
          getBookingsByPassengerID(meId),
          getRidesByDriver(meId).catch(() => ({data: []})),
        ]);

        const passengerBookings = (bookingsRes.data ?? []) as Booking[];
        const ridesForBookings = await Promise.all(
          passengerBookings.map(async (b) => {
            const rideRes = await getRideByRideID(b.rideId);
            const ride = rideRes.data as Ride;
            let driverName: string | undefined;
            try {
              const driver = await getUserByID(ride.driverId);
              driverName = driver.data?.name;
            } catch {
              driverName = undefined;
            }
            return {ride, driverName, passengerId: b.passengerId};
          })
        );
        setBookings(ridesForBookings);
        setPostedRides(driverRidesRes.data ?? []);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", {day: "numeric", month: "short"});
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});

  const storeReceiverId = (chatId: string, receiverId: string) => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(`chat-receiver:${chatId}`, receiverId);
    } catch (_err) {
      // Ignore storage failures (private mode, quota).
    }
  };

  const handleOpenChat = async (driverId: number, rideId: number, passengerId: number) => {
    if (!currentUserId) return;
    const meId = String(currentUserId);
    const targetId = String(driverId);
    setOpeningChatFor(getBookingToken(rideId, passengerId));
    try {
      let chatId: string | undefined;
      try {
        const chatsRes = await getUserChats(meId);
        const rawChats = (chatsRes.data ?? []) as ChatApi[];
        const existing = rawChats.find((chat) => {
          const participants = (chat.participants ?? []).map(String);
          return participants.includes(meId) && participants.includes(targetId);
        });
        chatId = existing ? String(existing.id ?? "") : undefined;
      } catch (_err) {
        chatId = undefined;
      }

      if (!chatId) {
        const res = await createChat({participants: [meId, targetId]});
        chatId = String(res.data?.id ?? `${meId}-${targetId}`);
      }

      if (!chatId) {
        throw new Error("Missing chat id");
      }

      storeReceiverId(chatId, targetId);
      router.push(`/messages/${chatId}`);
    } catch (error) {
      console.error("Failed to open chat", error);
      showAlert("Danger", "Unable to open the chat.");
    } finally {
      setOpeningChatFor(null);
    }
  };

  const handleCancelBooking = async (rideId: number, passengerId: number) => {
    setWorkingBooking(getBookingToken(rideId, passengerId));
    try {
      await deleteBooking(rideId, passengerId);
      setBookings((prev) =>
        prev.filter((b) => !(b.ride.id === rideId && b.passengerId === passengerId))
      );
    } catch (error) {
      console.error("Failed to cancel booking", error);
      showAlert("Danger", "Unable to cancel.");
    } finally {
      setWorkingBooking(null);
    }
  };

  const handleDeleteRide = async (rideId: number) => {
    setWorkingRide(rideId);
    try {
      await deleteRide(rideId);
      setPostedRides((prev) => prev.filter((r) => r.id !== rideId));
    } catch (error) {
      console.error("Failed to delete ride", error);
      showAlert("Danger", "Unable to delete the ride.");
    } finally {
      setWorkingRide(null);
    }
  };

  const handleConfirmDeleteRide = async () => {
    if (confirmDeleteRideId === null) return;
    const rideId = confirmDeleteRideId;
    await handleDeleteRide(rideId);
    setConfirmDeleteRideId(null);
  };

  const handleCreateRating = async (rideId: number, driverId: number, rating: number) => {
    if (!currentUserId) return;
    setRatingRideId(rideId);
    try {
      const payload: CreateRatingPayload = {
        rideId,
        userDriverId: driverId,
        userPassengerId: currentUserId,
        rating,
      };
      await createRating(payload);
      setBookings((prev) =>
        prev.map((item) => {
          if (item.ride.id !== rideId) return item;
          const nextRatings = (item.ride.ratings ?? []).concat([
            {userPassengerId: currentUserId, rating},
          ]);
          return {
            ...item,
            ride: {
              ...item.ride,
              ratings: nextRatings,
            },
          };
        })
      );
    } catch (error) {
      console.error("Failed to submit rating", error);
      showAlert("Danger", "Unable to submit rating.");
    } finally {
      setRatingRideId(null);
    }
  };

  const handleCompleteRide = async (rideId: number) => {
    setCompletingRide(rideId);
    try {
      await updateRide(rideId, {status: "Completed"});
      setPostedRides((prev) =>
        prev.map((ride) => (ride.id === rideId ? {...ride, status: "Completed"} : ride))
      );
      showAlert("Success", "Ride has been completed.");
    } catch (error) {
      console.error("Failed to complete ride", error);
      showAlert("Danger", "Unable to mark the ride as completed.");
    } finally {
      setCompletingRide(null);
    }
  };

  const getBookingToken = (rideId: number, passengerId: number) => `${rideId}-${passengerId}`;

  const upcoming = useMemo(
    () => bookings.filter((b) => b.ride.status !== "Completed" && b.ride.status !== "Canceled"),
    [bookings]
  );
  const past = useMemo(
    () => bookings.filter((b) => b.ride.status === "Completed" || b.ride.status === "Canceled"),
    [bookings]
  );
  const upcomingDriver = useMemo(
    () => postedRides.filter((ride) => ride.status !== "Completed"),
    [postedRides]
  );
  const pastDriver = useMemo(
    () => postedRides.filter((ride) => ride.status === "Completed"),
    [postedRides]
  );

  const renderRideCard = (item: BookingWithRide) => {
    const isSelfDriver = currentUserId !== null && item.ride.driverId === currentUserId;
    const rideStatus = item.ride.status ?? "Scheduled";
    const isCompleted = rideStatus === "Completed";
    const isCanceled = rideStatus === "Canceled";
    const existingRating = item.ride.ratings?.find(
      (rating) => String(rating.userPassengerId) === String(currentUserId ?? "")
    );
    const ratingValue = existingRating?.rating ?? 0;
    const canRate = isCompleted && !existingRating;
    const isHovering = hoveredRideId === item.ride.id && hoveredRating !== null;
    const displayRating = isHovering ? hoveredRating : ratingValue;

    const bookingToken = getBookingToken(item.ride.id, item.passengerId);

    return (
      <Card key={bookingToken} className="w-full">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <Badge className="rounded-full px-3 py-1 text-xs">
              {isCompleted ? "Completed" : isCanceled ? "Canceled" : "Scheduled"}
            </Badge>
            <p className="text-sm text-muted-foreground">{formatDate(item.ride.dateTime)}, {formatTime(item.ride.dateTime)}</p>
          </div>
          <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-black mt-2" />
              <div>
                <p className="text-muted-foreground text-sm">Pick-up</p>
                <p className="font-medium">{item.ride.origin}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="h-2 w-2 rounded-full bg-black mt-2" />
              <div>
                <p className="text-muted-foreground text-sm">Drop-off</p>
                <p className="font-medium">{item.ride.destination}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarImage src="/avatars/shadcn.jpg" alt="driver" />
                  <AvatarFallback className="rounded-lg">{(item.driverName ?? "?").slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="font-medium">{item.driverName ?? `Driver #${item.ride.driverId}`}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <LucideStar className="h-3 w-3" /> Driver
                  </p>
                </div>
              </div>
              {!isCompleted && !isCanceled && (
                <div className="flex gap-2">
                {!isSelfDriver && (
                  <Button
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => handleOpenChat(item.ride.driverId, item.ride.id, item.passengerId)}
                    disabled={openingChatFor === bookingToken}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" /> Chat
                  </Button>
                )}
                  <Button
                    variant="outline"
                    className="h-9 px-3"
                    onClick={() => handleCancelBooking(item.ride.id, item.passengerId)}
                    disabled={workingBooking === bookingToken}
                  >
                    {workingBooking === bookingToken ? "Canceling..." : "Cancel"}
                  </Button>
                </div>
              )}
            </div>
            {isCompleted ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const filled = value <= displayRating;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={canRate ? "p-1 cursor-pointer" : "p-1 cursor-default"}
                        onClick={() => {
                          if (!canRate || ratingRideId === item.ride.id) return;
                          handleCreateRating(item.ride.id, item.ride.driverId, value);
                        }}
                        onMouseEnter={() => {
                          if (!canRate) return;
                          setHoveredRideId(item.ride.id);
                          setHoveredRating(value);
                        }}
                        onMouseLeave={() => {
                          if (!canRate) return;
                          setHoveredRideId(null);
                          setHoveredRating(null);
                        }}
                        disabled={!canRate || ratingRideId === item.ride.id}
                        aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                      >
                        <LucideStar
                          className={
                            filled
                              ? "h-4 w-4 text-yellow-500 transition-colors"
                              : "h-4 w-4 text-muted-foreground transition-colors"
                          }
                          fill={filled ? "currentColor" : "none"}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPostedRide = (ride: Ride, isPast = false) => (
    <Card key={ride.id} className="w-full">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <Badge className="rounded-full px-3 py-1 text-xs">{isPast ? "Completed" : "Posted"}</Badge>
          <p className="text-sm text-muted-foreground">{formatDate(ride.dateTime)}, {formatTime(ride.dateTime)}</p>
        </div>
        <div className="space-y-2 rounded-xl bg-gray-100/65 p-4">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-black mt-2" />
            <div>
              <p className="text-muted-foreground text-sm">Pick-up</p>
              <p className="font-medium">{ride.origin}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-black mt-2" />
            <div>
              <p className="text-muted-foreground text-sm">Drop-off</p>
              <p className="font-medium">{ride.destination}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">You&apos;re driving</p>
            {!isPast ? (
              <div className="flex gap-2">
                <Badge variant="outline">{ride.availableSeats} seats left</Badge>
                <Button
                  variant="outline"
                  onClick={() => handleCompleteRide(ride.id)}
                  disabled={completingRide === ride.id}
                >
                  {completingRide === ride.id ? "Completing..." : "Complete"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setConfirmDeleteRideId(ride.id)}
                  disabled={workingRide === ride.id}
                  aria-label="Delete ride"
                  className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-6">
        {confirmDeleteRideId !== null ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => {
              if (workingRide === confirmDeleteRideId) return;
              setConfirmDeleteRideId(null);
            }}
          >
            <div
              className="w-full max-w-sm rounded-xl bg-background p-6 shadow-lg"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-cancel-ride-title"
              aria-describedby="confirm-cancel-ride-description"
            >
              <h3 id="confirm-cancel-ride-title" className="text-lg font-semibold">
                Cancel ride
              </h3>
              <p id="confirm-cancel-ride-description" className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to cancel this ride?
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleConfirmDeleteRide}
                  disabled={workingRide === confirmDeleteRideId}
                >
                  {workingRide === confirmDeleteRideId ? "Deleting..." : "Yes, cancel"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDeleteRideId(null)}
                  disabled={workingRide === confirmDeleteRideId}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        ) : null}
        

        <div className="flex flex-col gap-8">
          <div className="space-y-2 text-center">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
              My Rides
            </h1>
            <p className="text-muted-foreground">
              Review your booked rides and the ones you posted.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant={viewMode === "passenger" ? "default" : "outline"}
                onClick={() => setViewMode("passenger")}
              >
                Passenger
              </Button>
              <Button
                variant={viewMode === "driver" ? "default" : "outline"}
                onClick={() => setViewMode("driver")}
              >
                Driver
              </Button>
            </div>
          </div>

          <div className="w-full max-w-5xl mx-auto bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min p-3">
            {loading ? (
              <p className="text-sm text-muted-foreground px-2">Loading...</p>
            ) : (
              <div className="flex flex-col items-center gap-6">
                {viewMode === "passenger" ? (
                  <>
                    <div className="w-full">
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-semibold">Upcoming Rides</h2>
                      </div>
                      <div className="mt-3 space-y-3">
                        {upcoming.length === 0 ? (
                          <p className="text-sm text-muted-foreground px-2">No upcoming rides.</p>
                        ) : (
                          upcoming.map((b) => renderRideCard(b))
                        )}
                      </div>
                    </div>

                    <Separator className="w-full max-w-xl" />

                    <div className="w-full">
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-semibold">Past Rides</h2>
                        <p className="text-sm text-muted-foreground">Completed rides</p>
                      </div>
                      <div className="mt-3 space-y-3">
                        {past.length === 0 ? (
                          <p className="text-sm text-muted-foreground px-2">No history yet.</p>
                        ) : (
                          past.map((b) => renderRideCard(b))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full">
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-semibold">Upcoming Drives</h2>
                        <p className="text-sm text-muted-foreground">Edit or delete</p>
                      </div>
                      <div className="mt-3 space-y-3">
                        {upcomingDriver.length === 0 ? (
                          <p className="text-sm text-muted-foreground px-2">No upcoming drives.</p>
                        ) : (
                          upcomingDriver.map((r) => renderPostedRide(r))
                        )}
                      </div>
                    </div>

                    <Separator className="w-full max-w-xl" />

                    <div className="w-full">
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-semibold">Past Drives</h2>
                        <p className="text-sm text-muted-foreground">Completed rides</p>
                      </div>
                      <div className="mt-3 space-y-3">
                        {pastDriver.length === 0 ? (
                          <p className="text-sm text-muted-foreground px-2">No past drives.</p>
                        ) : (
                          pastDriver.map((r) => renderPostedRide(r, true))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
