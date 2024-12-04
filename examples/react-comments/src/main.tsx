import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import { LiveblocksProvider } from "@liveblocks/react";

let roomId = "react-comments";

applyExampleRoomId();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LiveblocksProvider
      baseUrl="http://localhost:5100"
      authEndpoint2="http://localhost:5100/v2/c/auth"
      authEndpoint={async (room) => {
        const headers = {
          "Content-Type": "application/json",
        };

        const body = JSON.stringify({
          room,
        });

        const response = await fetch("http://localhost:5100/v2/c/auth", {
          method: "POST",
          headers,
          body,
          credentials: 'include'
        });
        const result = await response.json();

        return result;
      }}
      // Get users' info from their ID
      resolveUsers={async ({ userIds }) => {
        const searchParams = new URLSearchParams(
          userIds.map((userId) => ["userIds", userId])
        );
        const response = await fetch(`http://localhost:5100/v2/c/users?${searchParams}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error("Problem resolving users");
        }

        const users = await response.json();
        return users;
      }}
      // publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY}
    >
      <App roomId={roomId} />
    </LiveblocksProvider>
  </React.StrictMode>
);

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
function applyExampleRoomId() {
  if (typeof window === "undefined") {
    return;
  }

  const query = new URLSearchParams(window?.location?.search);
  const exampleId = query.get("exampleId");

  if (exampleId) {
    roomId = exampleId ? `${roomId}-${exampleId}` : roomId;
  }
}
