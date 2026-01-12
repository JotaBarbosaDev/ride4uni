"use client"

import * as React from "react"
import { ActivityIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { socket } from "@/Service/socket.js"
import { getToken } from "@/api/authService.js"

type OnlineUsersPayload = {
  count: number
}

export  function ActiveNowCard({
  autoConnect = true,
}: {
  autoConnect?: boolean
}) {
  const [count, setCount] = React.useState<number>()

  React.useEffect(() => {
    if (!autoConnect) return

    const handleOnlineUsers = (data: OnlineUsersPayload) => {
      setCount(data.count)
    }

    socket.on("online-users", handleOnlineUsers)

    if (!socket.connected) {
      getToken().then((res) => {
        socket.auth = { token: res.data.token };
        socket.connect();
      });
    }

    socket.emit("get-online-users")

    return () => {
      socket.off("online-users", handleOnlineUsers)
    }
  }, [autoConnect])

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
        <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
          <ActivityIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <div className="text-3xl font-bold">{count ?? "..."}</div>
        <p className="text-xs text-muted-foreground mt-1">Users online</p>
      </CardContent>
    </Card>
  )
}
