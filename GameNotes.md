# REGRAS DE OURO

# COISAS PARA RESOLVER

## CollisionManager.canMove() não considera entity–entity collisions

### canMove() method

Hoje:

```typescript
static canMove(collider, futureX, futureY) {
   // só considera paredes
}
```

Isso é aceitável no MVP enquanto não existem NPCs ou inimigos, mas assim que existir o primeiro slime, ele vai entrar dentro do player.

## Colisão do player nas bordas do mapa

No momento o player pode se mover além das bordas do mapa, sumindo da tela pois a câmera tem clamp nas bordas.
Futuramente é preciso adicionar colisão com as bordas do mapa, caso o player possa chegar até elas.
