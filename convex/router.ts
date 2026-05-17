import { httpRouter } from "convex/server";

const http = httpRouter();

// Add any custom HTTP endpoints here if needed
// Example:
// http.route({
//   path: "/api/export",
//   method: "GET",
//   handler: httpAction(async (ctx, req) => {
//     // Handle export functionality
//   }),
// });

export default http;
