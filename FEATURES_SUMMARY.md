# Feature Summary - New Additions

## 🎮 New Features Added

### 1. 📝 Item Descriptions
- Hover over any item in inventory to see its description
- Helps players understand item purpose and function
- Simple to add: just include `description` field in item definition

### 2. 💊 Consumable Items  
- Mark items as `type: "consumable"`
- Players can click items in inventory to use them anytime
- Confirmation dialog before consumption
- Effects applied immediately (heal, restore stamina, etc.)
- Item removed from inventory after use

### 3. 🏪 Shop/Market System
- Add shops to any page with `shop` configuration
- Players buy items using in-game currency (variables)
- Features:
  - Unlimited or limited stock
  - Stock persists (doesn't reset when leaving)
  - Shows "Owned", "Out of Stock", "Can't Afford" states
  - Item descriptions on hover in shop too

### 4. ⚔️ Combat System
- Define enemies with stats and descriptions
- Combat choices trigger battle dialog
- **Manual resolution**: Player fights externally, inputs results
- Player enters final stats after battle
- Choose victory or defeat
- Different pages for win/lose outcomes
- Optional effects for both outcomes

## 📦 Quick JSON Examples

### Consumable Item
```json
{
  "id": "health_potion",
  "name": "Health Potion",
  "type": "consumable",
  "description": "Restores 10 HP",
  "effects": { "stats": { "Health": 10 } }
}
```

### Shop on Page
```json
{
  "shop": {
    "currency": "gold",
    "items": [
      { "itemId": "health_potion", "price": 15, "quantity": 3 }
    ]
  }
}
```

### Combat Choice
```json
{
  "text": "Fight!",
  "combat": {
    "enemyId": "goblin",
    "winPageId": 20,
    "losePageId": 21
  }
}
```

## 🧪 Test Files

1. **comprehensive-test.json** - Original full test
2. **complete-features-test.json** - NEW! Tests all new features

## ✅ Fully Backward Compatible
- All existing stories work without changes
- All new features are optional
- No breaking changes

## 🎯 Use Cases

- **RPG Adventures**: Combat, shops, healing items
- **Mystery Games**: Consumable clues, investigation items
- **Survival Stories**: Resource management, trading
- **Fantasy Quests**: Equipment shops, potions, battles

---

See **NEW_FEATURES.md** for detailed documentation!
