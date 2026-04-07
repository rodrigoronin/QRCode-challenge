export type DamagePayload = {
  value: number,
  isCrit: boolean,
  type?: 'physical' | 'fire' | 'ice' | 'poison',
  position: { x: number, y: number},
}
