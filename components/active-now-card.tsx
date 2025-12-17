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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">+201 since last hour</p>
      </CardContent>
    </Card>
  )
}

