/**
 * Jaccard similarity between two string arrays (case-insensitive).
 * Returns 0 if either set is empty.
 */
export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map(s => s.toLowerCase()));
  const setB = new Set(b.map(s => s.toLowerCase()));
  let intersection = 0;
  for (const g of setA) { if (setB.has(g)) intersection++; }
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Jaccard similarity between two frequency maps (Map<string, number>).
 * Returns 1 if both maps are empty.
 */
export function jaccardMapSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  const setA = new Set(a.keys());
  const setB = new Set(b.keys());
  const intersection = [...setA].filter(k => setB.has(k)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 1;
  return intersection / union;
}

/**
 * Nearest-neighbor tour ordering for a list of named 2D points.
 * Returns city names in visit order, starting from the first city.
 */
export function nearestNeighborRoute(cities: Array<{ name: string; x: number; y: number }>): string[] {
  if (cities.length <= 1) return cities.map(c => c.name);
  const unvisited = [...cities];
  const route = [unvisited.splice(0, 1)[0]];
  while (unvisited.length > 0) {
    const last = route[route.length - 1];
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const dx = unvisited[i].x - last.x;
      const dy = unvisited[i].y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) { minDist = dist; nearest = i; }
    }
    route.push(unvisited.splice(nearest, 1)[0]);
  }
  return route.map(c => c.name);
}
