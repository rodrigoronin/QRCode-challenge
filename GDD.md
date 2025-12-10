# 🎮 GDD – Projeto: Mini SAO Online

_(Pixel Action RPG Top-Down inspirado em SAO, HLD e Ragnarok Online)_

---

## 1. Visão Geral

**Gênero:** Action RPG
**Estilo Visual:** Pixel Art top-down (inspirado em Hyper Light Drifter, Eastward, Zelda GB).
**Plataformas Alvo:** PC com versão de testes no browser, com escalabilidade futura para consoles.

**Pilares do Jogo:**

1. **Exploração e Risco** – Explorar mapas, entrar em dungeons/towers, decidir até onde avançar antes de recuar para segurança.
2. **Combate Ágil e Estratégico** – movimentação livre, dashes, skills e basic attacks, leitura de padrões de inimigos.
3. **Progressão e Customização** – crescimento via atributos, equipamentos, skills e habilidades (sem classes fixas, mas com arquétipos para guiar os jogadores).

---

## 2. Loop Principal de Jogo

O jogo gira em torno de um **ciclo de progressão e risco-recompensa**, inspirado em Sword Art Online e Ragnarok Online.

```text
[CIDADE/BASE] → [PREPARAÇÃO/PEGAR QUESTS] → [EXPLORAR MAPA/DUNGEON/TORRE] → [COMBATE & FARM / BOSS] → [RETORNO À BASE]
```

### Etapas:

1. **Cidade/Base:**

   - Aceitar quests/missões, comprar suprimentos, poções e forjar/melhorar equipamentos.
   - Interagir com NPCs (mercador, ferreiro, tutores de habilidades).
   - Distribuir pontos de status e aprender novas skills.

2. **Dungeon/Torre:**

   - Gerada proceduralmente (ou criada a mão no MVP).
   - A exploração dos mapas normais (não dungeons) é livre e sem tempo.
   - As dungeons tem um timer, cada sala/andar aumenta a dificuldade e qualidade do loot.
   - O jogador pode sair a qualquer momento, mas não recebe a recompensa da dungeon.
   - Caso morra o jogador perdek os drops e recebe apenas a experiência já adquirida.

3. **Combate:**

   - **Movimentação livre 8 direções (apenas 4 no MVP).**
   - **Ataques básicos + cooldowns dependentes da arma.**
   - **Dash**, **parry**, **skills ativas e passivas**.
   - Equipamentos alteram velocidade, defesa, cast time e podem conceder efeitos especiais.

4. **Progressão:**

   - XP → Level → Pontos de Atributo.
   - Encantamento e upgrades de armas/armaduras.
   - Escolha livre de builds e estilos (sem classes fixas).

5. **Retorno à Base:**
   - Conversão de loot em moeda ou materiais (via crafting).
   - Desbloqueio de novos mapas, NPCs, quests/missões e dungeons.
   - Recomeço do ciclo com mais poder e novos desafios.

---

## 2. Mecânicas Centrais e Progressão

### 2.1 Atributos e Status

O jogador evolui de nível e distribui pontos entre **atributos-base**:

| Atributo               | Efeito Principal                           | Influência Secundária                            |
| ---------------------- | ------------------------------------------ | ------------------------------------------------ |
| **STR** (Força)        | Aumenta dano físico e carga de equipamento | Melhora resistência a stagger                    |
| **AGI** (Agilidade)    | Aumenta velocidade de ataque               | Aumenta levemente a velocidade de movimento      |
| **VIT** (Vitalidade)   | Aumenta HP e defesa física                 | Aumenta regeneração natural                      |
| **DEX** (Destreza)     | Aumenta dano físico a distância            | Reduz tempo de recarga de habilidades físicas    |
| **INT** (Inteligência) | Aumenta dano mágico                        | Reduz cast time                                  |
| **WIS** (Sabedoria)    | Aumenta dano divino e resistência mágica   | Aumenta a mana máxima                            |
| **LUK** (Sorte)        | Aumenta chance crítica                     | Aumenta chance de esquiva (reduzir dano sofrido) |

---

### 2.2 Disciplinas (sistema de aprendizado de habilidades)

Em vez de classes fixas, o jogador aprende **Disciplinas** com **NPCs tutores** ou **equipamentos únicos** espalhados pelo mundo.

Cada Disciplina tem (sujeito a alterações futuras):

- Um **tema/arquétipo** (ex: Pyromancer, Swordmaster, Guardian, Paladin, etc.),
- Um **caminho de progressão interno** (pequena árvore de 3 a 5 habilidades),
- **Requisitos de atributos** e **custo em pontos de técnica (TP)** para evoluir.

Exemplo:

**Disciplina: Pyromancer**
| Habilidade | Descrição | Requisitos | Custo TP |
|------------|-----------|------------|----------|
| **Firewall** | Cria uma linha de fogo que causa dano contínuo. | INT 10 | 1 |
| **Flame Shield** | Escudo de fogo que reduz dano físico e reflete parte do dano. | Firewall Nv.3 | 2 |
| **Inferno** | Invoca uma explosão massiva em área. | Flame Shield Nv.2, INT 20 | 3 |

- Ao aprender uma Disciplina, o jogador desbloqueia **a primeira habilidade** e pode evoluí-la gastando TP.
- Ao evoluir as habilidades, **novas ramificações** da árvore se abrem automaticamente.

---

### 2.3 Pontos de Técnica (TP)

- Ganhos ao subir de nível e usar as habilidades adquiridas.
- Usados para desbloquear ou evoluir habilidades em Disciplinas.
- Reset possível via item raro ou NPC especializado.

---

### 2.4 Sinergias e Equipamentos

- Armas e armaduras **potencializam certas Disciplinas** (ex: Salamander, espada flamejante que aumenta poder de técnicas de fogo).
- Equipamentos têm **níveis de encantamento** (até +10, por exemplo), que ampliam bônus e efeitos visuais.

---

## 3. Combate e Gameplay Moment-to-Moment

### 3.1 Filosofia de Combate

O combate é **rápido, fluido e reativo**, com ênfase em **posicionamento, leitura de padrões e timing de habilidades**.

---

### 3.2 Fundamentos do Combate

| Elemento            | Descrição                                 |
| ------------------- | ----------------------------------------- |
| **Movimentação**    | Livre em 8 direções (4 no MVP)            |
| **Ataque básico**   | Combos curtos                             |
| **Dash / Dodge**    | Movimento instantâneo com i-frames curtos |
| **Skills Ativas**   | Consomem mana, entram em cooldown         |
| **Skills Passivas** | Modificam atributos ou habilidades        |
| **Interação**       | Abrir baús, coletar loot, etc.            |

---

### 3.3 Recursos e Cooldowns

| Recurso       | Função                     | Regeneração              |
| ------------- | -------------------------- | ------------------------ |
| **HP**        | Vida                       | Poções e skills          |
| **Mana (MP)** | Skills ativas              | Regenera fora de combate |
| **Cooldowns** | Controlam ritmo do combate | -                        |

---

### 3.4 Tipos de Armas e Estilos

| Tipo                     | Alcance     | Velocidade  | Escalonamento | Estilo              |
| ------------------------ | ----------- | ----------- | ------------- | ------------------- |
| **Espadas de Uma Mão**   | Curto       | Alta        | STR/DEX       | Versátil            |
| **Espadas de Duas Mãos** | Longo       | Muito Baixa | STR           | Alto Dano - Stagger |
| **Lanças**               | Longo       | Média       | STR           | Controle            |
| **Machados**             | Médio       | Lento       | STR           | Alto dano - Stagger |
| **Arcos**                | Muito Longo | Média       | DEX           | Distância           |
| **Cajados**              | Médio       | Lento       | INT/WIS       | Mágico              |
| **Adagas**               | Muito Curto | Muito Alta  | DEX           | Crítico             |

---

## 4. Estrutura de Progressão e Economia

_(Conteúdo completo conforme definido nas mensagens anteriores, incluindo loot, forja, economia e vila)_

---

## 5. Estrutura da Dungeon / Torre (Andar 1)

_(Conteúdo completo com layout modular, inimigos e boss Pyre Warden)_

---

## 6. Estrutura Técnica e Arquitetura do Protótipo

_(Conteúdo completo conforme definido, com TypeScript, Pixi.js, Tauri e ECS)_

## 7. Tecnologias Utilizadas no MVP

O jogo será criado com tecnologias web nas seguintes versões. O package.json pode divergir e apresentar versões mais recentes após o MVP, mas nunca abaixo das listadas aqui:

- TypeScript: ^5.9.3
- tauri-apps/cli: ^2.9.4
- Pixi.js: ^8.14.3
- Projeto criado com Vite CLI na versão: ^7.2.4
