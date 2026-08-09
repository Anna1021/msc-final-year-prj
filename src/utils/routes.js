export function routeGroup(route) {
  if (route === "/" || route === "/dashboard") return "dashboard";
  if (route === "/final-challenge") return "final-challenge";
  if (route === "/missions" || route.startsWith("/mission")) return "dashboard";
  if (route === "/ai-lab" || route === "/token-lab") return "ai-lab";
  if (route === "/activity" || route.startsWith("/progress")) return "progress";
  return route.replace("/", "") || "dashboard";
}
