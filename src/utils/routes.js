export function routeGroup(route) {
  if (route === "/" || route === "/dashboard") return "dashboard";
  if (route === "/missions" || route.startsWith("/mission") || route === "/final-challenge") return "missions";
  if (route === "/activity" || route.startsWith("/progress")) return "progress";
  return route.replace("/", "") || "dashboard";
}
