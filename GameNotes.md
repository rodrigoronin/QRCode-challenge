## Hitbox do Player continua com um detalhe de design estranho

Hoje o hitbox.getBounds() retorna top-left, ótimo.

Mas a criação do Collider ainda assume que:

- Collider(width, height) → escala e centraliza no container

Isto é aceitável.
Mas, para o CollisionManager funcionar para NPCs e inimigos no futuro, recomendo padronizar:

- todo Collider é center-based internamente

- toda colisão usa top-left converted, como você faz agora

Isso não quebra nada agora, só deixo anotado pra não virar uma surpresa futura.

## CollisionManager.canMove() não considera entity–entity collisions

Hoje:

```typescript
static canMove(collider, futureX, futureY) {
   // só considera paredes
}
```

Isso é aceitável no MVP enquanto não existem NPCs ou inimigos.
Mas assim que existir o primeiro slime, ele vai entrar dentro do player.
