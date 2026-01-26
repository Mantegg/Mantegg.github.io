# Migration Guide - Adding New Features to Existing Stories

This guide shows how to add the new features to your existing gamebook stories.

## No Migration Needed!

**Good news:** Your existing stories will continue to work without any changes. All new features are optional.

However, if you want to enhance your story with the new features, here's how:

---

## Adding Item Descriptions

### Before (still works):
```json
{
  "items": [
    {
      "id": "sword",
      "name": "Iron Sword",
      "visible": true,
      "type": "key"
    }
  ]
}
```

### After (enhanced):
```json
{
  "items": [
    {
      "id": "sword",
      "name": "Iron Sword",
      "visible": true,
      "type": "key",
      "description": "A reliable blade forged from quality iron. Essential for combat."
    }
  ]
}
```

**What changes:** Just add a `description` field to any item you want to explain.

---

## Making Items Consumable

### Step 1: Change type to "consumable"
```json
{
  "id": "health_potion",
  "name": "Health Potion",
  "type": "consumable",  // Changed from "key" or other type
  "description": "Restores health when consumed"
}
```

### Step 2: Add effects
```json
{
  "id": "health_potion",
  "name": "Health Potion",
  "type": "consumable",
  "description": "Restores 10 health when consumed",
  "effects": {
    "stats": {
      "Health": 10
    }
  }
}
```

**Player experience:** They can now click the item in inventory to use it anytime!

---

## Adding a Shop to a Page

### Step 1: Add currency variable to player config

If you don't have currency yet:

```json
{
  "player": {
    "variables": {
      "gold": 100  // Starting gold
    }
  }
}
```

### Step 2: Add shop to a page

```json
{
  "id": 10,
  "title": "The Market",
  "text": "You enter a bustling marketplace.",
  "shop": {
    "currency": "gold",
    "items": [
      {
        "itemId": "health_potion",
        "price": 15,
        "quantity": 5  // Optional: limited stock
      },
      {
        "itemId": "map",
        "price": 30  // Omit quantity for unlimited stock
      }
    ]
  },
  "choices": [
    { "text": "Leave the market", "nextPageId": 1 }
  ]
}
```

### Step 3: Give players ways to earn currency

```json
{
  "choices": [
    {
      "text": "Search the chest",
      "effects": {
        "variables": {
          "gold": 25  // Adds 25 gold (or use positive number)
        }
      },
      "nextPageId": 15
    }
  ]
}
```

---

## Adding Enemy Definitions

Add an `enemies` array at the root level:

```json
{
  "meta": { "title": "My Story" },
  "player": { ... },
  "items": [ ... ],
  "enemies": [
    {
      "id": "goblin",
      "name": "Goblin Scout",
      "description": "A small but dangerous creature.",
      "stats": {
        "Health": 15,
        "Attack": 5,
        "Defense": 3
      },
      "note": "Relatively easy opponent for beginners."
    },
    {
      "id": "dragon",
      "name": "Fire Dragon",
      "description": "A massive beast with scales like armor.",
      "stats": {
        "Health": 100,
        "Attack": 20,
        "Defense": 15
      },
      "note": "Extremely dangerous! Only fight when fully prepared."
    }
  ],
  "pages": [ ... ]
}
```

---

## Adding Combat Encounters

### Replace this (old way):
```json
{
  "text": "A goblin attacks!",
  "choices": [
    {
      "text": "Fight (requires Attack 10+)",
      "requiresStat": { "name": "Attack", "min": 10 },
      "nextPageId": 20  // Win page
    },
    {
      "text": "Run away",
      "nextPageId": 21  // Flee page
    }
  ]
}
```

### With this (new combat system):
```json
{
  "text": "A goblin attacks!",
  "choices": [
    {
      "text": "Fight the Goblin!",
      "combat": {
        "enemyId": "goblin",
        "winPageId": 20,
        "losePageId": 21,
        "winEffects": {
          "variables": { "gold": 10 },
          "stats": { "Experience": 5 }
        },
        "loseEffects": {
          "stats": { "Health": -5 }
        }
      }
    },
    {
      "text": "Run away",
      "effects": { "stats": { "Stamina": -3 } },
      "nextPageId": 21
    }
  ]
}
```

**What happens:** 
1. Player clicks "Fight the Goblin!"
2. Combat dialog shows enemy stats and player stats
3. Player resolves battle manually
4. Player enters their final stats
5. Player chooses "Victory" or "Defeat"
6. Appropriate effects applied and navigates to correct page

---

## Complete Example: Before and After

### Before (original story):
```json
{
  "meta": { "title": "Forest Adventure" },
  "player": {
    "stats": { "Health": 20, "Attack": 10 }
  },
  "items": [
    { "id": "potion", "name": "Potion", "type": "key" }
  ],
  "pages": [
    {
      "id": 1,
      "text": "You find a potion and an enemy!",
      "addItems": ["potion"],
      "choices": [
        { "text": "Continue", "nextPageId": 2 }
      ]
    }
  ]
}
```

### After (enhanced):
```json
{
  "meta": { "title": "Forest Adventure" },
  "player": {
    "stats": { "Health": 20, "Attack": 10 },
    "variables": { "gold": 50 }
  },
  "items": [
    {
      "id": "potion",
      "name": "Health Potion",
      "type": "consumable",
      "description": "Restores 10 HP when used. Click to consume!",
      "effects": { "stats": { "Health": 10 } }
    },
    {
      "id": "sword",
      "name": "Steel Sword",
      "type": "key",
      "description": "A sturdy weapon for combat."
    }
  ],
  "enemies": [
    {
      "id": "wolf",
      "name": "Forest Wolf",
      "description": "A hungry predator.",
      "stats": { "Health": 15, "Attack": 7 }
    }
  ],
  "pages": [
    {
      "id": 1,
      "text": "You find a potion! A wolf appears!",
      "effects": { "itemsAdd": ["potion"] },
      "choices": [
        {
          "text": "Fight the wolf!",
          "combat": {
            "enemyId": "wolf",
            "winPageId": 2,
            "losePageId": 3
          }
        }
      ]
    },
    {
      "id": 2,
      "title": "Shop",
      "text": "You defeated the wolf! You find a traveling merchant.",
      "shop": {
        "currency": "gold",
        "items": [
          { "itemId": "potion", "price": 15, "quantity": 3 },
          { "itemId": "sword", "price": 40 }
        ]
      },
      "choices": [
        { "text": "Continue", "nextPageId": 4 }
      ]
    }
  ]
}
```

---

## Testing Your Enhanced Story

1. Start with ONE new feature at a time
2. Test thoroughly before adding more
3. Use the provided test stories as examples
4. Check console for any errors

## Need Help?

- See **NEW_FEATURES.md** for complete documentation
- Check **complete-features-test.json** for working examples
- All features are optional - add them at your own pace!

---

## Checklist for Full Enhancement

- [ ] Add descriptions to important items
- [ ] Convert healing items to consumables
- [ ] Add currency variable to player config
- [ ] Create at least one shop page
- [ ] Define enemies in enemies array
- [ ] Convert combat to use combat system
- [ ] Test purchasing items
- [ ] Test consuming items
- [ ] Test combat encounters
- [ ] Test save/load with new features

**Remember:** Take it step by step. Your existing story works fine as-is!
