# Fase 1 – Estrutura do Loop (Base Jogável Clara)

### Objetivo: Ter um loop simples Cidade → Dungeon → Cidade.

## 1.1 Estrutura da Vila (mínima)

- Criar mapa fixo da vila

- Spawn do player na vila

- NPC Vendor estático

- Sistema simples de interação (tecla para interagir)

- UI básica de loja (comprar 1 poção)

> Sem economia complexa.
> Só provar que o loop existe.

## 1.2 Sistema de Cena / Transição

- Sistema simples de “SceneManager”

- Transição vila → dungeon

- Transição dungeon → vila

- Reset básico de inimigos

> Isso organiza o jogo estruturalmente.

## 1.3 Wave System na Dungeon

- Spawn manager

- Contador de waves

- Delay entre waves

- Escalonamento simples (HP + dano)

- Quando a wave X termina → boss aparece.

> Isso vira o coração da demo.

## Fase 2 – Arquétipos Jogáveis

> Objetivo: 3 estilos distintos de gameplay.

### DPS

- Ataque básico rápido

- Skill ativa 1 (burst)

- Skill ativa 2 (mobility)

- Passiva simples (crit chance)

### Tank

- Ataque mais lento

- Skill taunt

- Skill escudo temporário

- Passiva de redução de dano

### Healer

- Ataque mágico básico

- Heal single target

- Área pequena de cura

- Passiva regen

> Não precisa sistema completo de disciplinas ainda.
> Só hardcoded por arquétipo.

> Card pequeno por skill.
> Nada de “Criar sistema de habilidades complexo”.

## Fase 3 – Variedade de Inimigos

### Objetivo: Forçar uso das habilidades.

Adicionar:

- Inimigo rápido (low HP, alta velocidade)

- Inimigo tanky (alto HP)

- Inimigo ranged (projétil simples)

- Boss com 2 fases

Boss precisa:

- Telegraph visível

- Mudança de padrão em 50% HP

> Isso cria espetáculo.

## Fase 4 – Progressão Simples

### Sem atributos complexos ainda.

- XP por kill

- Level up

- +HP e +Dano por level (fixo)

- Sistema simples de gold

- Comprar upgrade fixo na vila

> Isso valida progressão sem precisar da tabela gigante do GDD.

## Fase 5 – Polimento Básico

- Hit feedback melhorado

- Screen shake leve

- SFX diferenciados

- Barra de vida para inimigos

- UI mais clara

- Contador de wave na tela

> Isso transforma protótipo técnico em demo apresentável.
