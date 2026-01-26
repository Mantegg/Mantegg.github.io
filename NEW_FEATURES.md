# New Features Documentation

## Overview
This document describes all the new features added to the EGameBook engine.

## Table of Contents
1. [Item Descriptions (Hover Tooltips)](#1-item-descriptions-hover-tooltips)
2. [Consumable Items](#2-consumable-items)
3. [Shop/Market System](#3-shopmarket-system)
4. [Enemy System](#4-enemy-system)
5. [Combat System](#5-combat-system)
6. [Story ID System](#6-story-id-system)
7. [Enhanced Type System](#7-enhanced-type-system)

---

## 1. Item Descriptions (Hover Tooltips)

### Feature
Items in the inventory now support optional descriptions that appear when the player hovers their mouse over an item.

### JSON Format
```json
{
  "items": [
    {
      "id": "health_potion",
      "name": "Health Potion",
      "visible": true,
      "type": "consumable",
      "description": "A red potion that restores 10 health points when consumed."
    }
  ]
}
```

### Usage
- Add a `description` field to any item in the `items` array
- The description will automatically appear as a tooltip when hovering over the item in the inventory panel
- Works for all item types

---

## 2. Consumable Items

### Feature
Items marked as `type: "consumable"` can be used anytime during gameplay by clicking on them in the inventory. A confirmation dialog appears before consumption.

### JSON Format
```json
{
  "items": [
    {
      "id": "health_potion",
      "name": "Health Potion",
      "visible": true,
      "type": "consumable",
      "description": "Restores 10 health when consumed.",
      "effects": {
        "stats": {
          "Health": 10
        }
      }
    }
  ]
}
```

### Usage
1. Set `type: "consumable"` on the item
2. Add an `effects` object with the effects to apply when consumed
3. Player clicks the item in inventory → confirmation dialog → item is consumed and removed from inventory
4. Effects support:
   - `stats`: Modify player stats
   - `itemsAdd`: Add new items
   - `variables`: Change game variables

### Features
- Visual indicator (pill icon) on consumable items
- Confirmation dialog shows item description and effects
- Item is removed from inventory after use
- Effects are applied immediately

---

## 3. Shop/Market System

### Feature
Pages can now include shops where players can purchase items using in-game currency (tracked as variables).

### JSON Format
```json
{
  "pages": [
    {
      "id": 10,
      "title": "General Store",
      "text": "Welcome to the shop!",
      "shop": {
        "currency": "gold",
        "items": [
          {
            "itemId": "health_potion",
            "price": 15,
            "quantity": 3
          },
          {
            "itemId": "magic_sword",
            "price": 50
          }
        ]
      },
      "choices": [...]
    }
  ]
}
```

### Configuration
- **currency**: Name of the variable used as currency (e.g., "gold", "coins")
- **items**: Array of shop items
  - **itemId**: References an item from the `items` array
  - **price**: Cost in currency units
  - **quantity** (optional): Available stock. If not specified, unlimited stock

### Features
- Currency displayed prominently in shop UI
- Items show name, description (on hover), type badge, and price
- "Buy" button disabled if player can't afford or already owns the item
- Stock tracking: quantity decreases when purchased
- Stock persists: if player leaves and returns, sold items remain sold
- "Out of Stock" badge when quantity reaches 0
- "Owned" badge if player already has the item

### Shop State Persistence
- Shop inventories are saved in game state
- Saved with save games
- Reset when restarting the story

---

## 4. Enemy System

### Feature
Authors can define enemies with stats and descriptions. These can be referenced in combat encounters.

### JSON Format
```json
{
  "enemies": [
    {
      "id": "goblin",
      "name": "Goblin Raider",
      "description": "A small but vicious goblin.",
      "stats": {
        "Health": 15,
        "Attack": 6,
        "Defense": 3
      }
    },
    {
      "id": "dragon",
      "name": "Ancient Dragon",
      "description": "A massive dragon with impenetrable scales.",
      "stats": {
        "Health": 100,
        "Attack": 25,
        "Defense": 20
      },
      "note": "Extremely dangerous! Make sure you're prepared."
    }
  ]
}
```

### Fields
- **id**: Unique identifier
- **name**: Display name
- **description** (optional): Lore description
- **stats** (optional): Enemy statistics (flexible - define any stats you need)
- **note** (optional): Author note/warning shown to players

### Legacy Support
- Still supports `hayat`, `attack`, `rank` fields for backward compatibility

---

## 5. Combat System

### Feature
Choices can trigger combat encounters. Players resolve battles manually (using dice, imagination, or external systems), then input the results.

### JSON Format
```json
{
  "choices": [
    {
      "text": "Fight the Goblin!",
      "combat": {
        "enemyId": "goblin",
        "winPageId": 20,
        "losePageId": 21,
        "winEffects": {
          "stats": { "Experience": 10 },
          "variables": { "gold": 15 }
        },
        "loseEffects": {
          "stats": { "Health": -10 }
        }
      }
    }
  ]
}
```

### Combat Configuration
- **enemyId**: References an enemy from the `enemies` array
- **winPageId**: Page to navigate to if player wins
- **losePageId**: Page to navigate to if player loses
- **winEffects** (optional): Effects applied on victory
- **loseEffects** (optional): Effects applied on defeat

### Combat Flow
1. Player clicks a choice with combat
2. Combat dialog appears showing:
   - Enemy name, description, and stats
   - Player's current stats
   - Input fields for player's final stats
   - Instructions to resolve battle manually
3. Player fights the battle externally
4. Player enters their final stats after the battle
5. Player clicks "I Won!" or "I Was Defeated"
6. Player stats are updated
7. Appropriate effects are applied
8. Player is navigated to win/lose page

### Visual Indicators
- Combat choices show a sword icon
- Combat choices have red highlight on hover
- Enemy information displayed in red-themed panel

### Features
- Fully manual combat resolution (compatible with any system)
- Stats update based on player input
- Win/lose branching paths
- Optional effects on both outcomes
- Cancel option if player changes their mind

---

## 6. Story ID System

### Feature
Each story can now have a unique identifier (`storyId`) to ensure saves are properly isolated per story, preventing save conflicts between different stories.

### JSON Format
```json
{
  "meta": {
    "title": "My Adventure",
    "author": "Author Name",
    "version": "1.0",
    "storyId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Benefits
- **Save Isolation**: Saves are tied to specific stories
- **No Conflicts**: Stories with same title won't share saves
- **Version Safe**: Same storyId across versions allows save compatibility
- **Future Proof**: Better save management for multi-story projects

### Backward Compatibility
- Optional field (legacy stories work without it)
- Fallback to title-based matching for old stories
- Automatic legacy ID generation: `legacy-{title}`

### See Also
- **[STORY_ID_GUIDE.md](STORY_ID_GUIDE.md)** - Complete guide and best practices

---

## 7. Enhanced Type System

All new features are fully typed in TypeScript with updated interfaces:

```typescript
// Updated ItemDef
interface ItemDef {
  id: string;
  name: string;
  visible?: boolean;
  type?: 'consumable' | 'clue' | 'key' | 'token' | 'flag';
  description?: string; // NEW
  effects?: PageEffects; // NEW
}

// New EnemyDef
interface EnemyDef {
  id: string;
  name: string;
  description?: string;
  stats?: Record<string, number>;
  note?: string;
}

// New CombatChoice
interface CombatChoice {
  enemyId: string;
  winPageId: number | string;
  losePageId: number | string;
  winEffects?: PageEffects;
  loseEffects?: PageEffects;
}

// Updated Choice
interface Choice {
  // ...existing fields...
  combat?: CombatChoice; // NEW
}

// Updated Page
interface Page {
  // ...existing fields...
  shop?: ShopConfig; // NEW
}

// New ShopConfig
interface ShopConfig {
  currency: string;
  items: ShopItem[];
}

interface ShopItem {
  itemId: string;
  price: number;
  quantity?: number;
}
```

---

## Testing

Two test stories are provided:

1. **comprehensive-test.json** - Original comprehensive test
2. **complete-features-test.json** - NEW! Tests all new features including:
   - Shop system with multiple shops
   - Consumable items (health potions, elixirs)
   - Item descriptions on hover
   - Combat encounters (goblin, bandit, dragon)
   - Currency management
   - Stock tracking

### How to Test

1. Start the dev server: `npm run dev`
2. Upload `complete-features-test.json` from the welcome screen
3. Test each feature:
   - **Shops**: Visit General Store and Armory to buy items
   - **Consumables**: Buy potions, then click them in inventory to use
   - **Hover**: Hover over items in inventory to see descriptions
   - **Combat**: Fight goblins, bandits, or the dragon
   - **Currency**: Spend and earn gold throughout the adventure
   - **Stock**: Leave and return to shops to verify stock persistence

---

## Backward Compatibility

All new features are **100% backward compatible**:
- Old stories without these features will work exactly as before
- New fields are all optional
- Legacy enemy format (`hayat`, `attack`, `rank`) still supported
- Existing item format continues to work

---

## Implementation Notes

### State Management
- Shop inventories stored in `gameState.shopInventories`
- Persisted across save/load
- Reset on restart
- Keyed by page ID and item ID

### Consumable Items
- Handled through `consumeItem` hook function
- Removes item from inventory
- Applies effects immediately
- No page navigation (happens in-place)

### Combat
- Stats updated directly in game state
- No automatic calculation (manual resolution)
- Flexible stat system (any stat names supported)
- Both win and lose paths required

---

## Best Practices

### For Authors

1. **Item Descriptions**: Always add descriptions to help players understand items
2. **Consumables**: Clearly communicate effects in description
3. **Shops**: Balance prices with available currency sources
4. **Combat**: Provide clear enemy stats and warnings for difficult battles
5. **Currency**: Use consistent variable names (e.g., always "gold")

### Examples

Good consumable item:
```json
{
  "id": "health_potion",
  "name": "Health Potion",
  "type": "consumable",
  "description": "Restores 10 health when consumed. Use wisely!",
  "effects": { "stats": { "Health": 10 } }
}
```

Good shop setup:
```json
{
  "shop": {
    "currency": "gold",
    "items": [
      { "itemId": "health_potion", "price": 15, "quantity": 3 },
      { "itemId": "map", "price": 25 }
    ]
  }
}
```

Good combat setup:
```json
{
  "combat": {
    "enemyId": "dragon",
    "winPageId": 100,
    "losePageId": 101,
    "winEffects": {
      "variables": { "gold": 100, "dragon_slayer": true }
    }
  }
}
```

---

## Future Enhancements

Potential additions for future versions:
- Automatic combat resolution option
- Item durability/charges
- Trading between players (multiplayer)
- Crafting system
- Quest log
- Achievement system
