import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session_uid");

  // 1. Protect the dashboard routes
  if (event.route.id?.includes("(protected)")) {
    if (!sessionId) {
      throw redirect(303, "/login");
    }
  }

  // 2. Protect the internal API (optional but good practice)
  // Prevent people from calling your internal APIs without being logged in
  if (
    event.url.pathname.startsWith("/api") &&
    !event.url.pathname.includes("/session")
  ) {
    if (!sessionId) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  return resolve(event);
};
