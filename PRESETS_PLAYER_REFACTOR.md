# Presets & Player System - Complete Refactor 🎯

## Overview

This document explains the **completely refactored Presets and Player system** based on your requirements. The new architecture eliminates redundancy and provides a clean, logical flow from author setup to player character creation.

---

## Key Concepts

### **Section Name vs Display Title**

In the **Sections Editor**:
- **Name (ID)**: Internal identifier used for navigation and references in code (e.g., `"chapter_1"`, `"dark_path"`)
- **Display Title**: What players actually see in the game (e.g., `"Chapter 1: The Beginning"`, `"The Dark Path"`)

**Example:**
```json
{
  "id": 1,
  "name": "prologue",           // ← Used in code/navigation
  "title": "Prologue: Awakening" // ← Shown to players
}
```

---

## New Architecture

### **OLD System (Redundant)** ❌

```
Presets {
  stats: { SKILL: {...}, STAMINA: {...} }
  items: { sword: {...}, potion: {...} }    // ← Redundant!
  enemies: { goblin: {...}, dragon: {...} }  // ← Redundant!
  variables: {...}
}

Items Array: [{ id: "sword", ... }]         // ← Duplicate!
Enemies Array: [{ id: "goblin", ... }]      // ← Duplicate!

Player {
  stats: { SKILL: 10, STAMINA: 20 }         // ← Direct assignment
  inventory: ["sword"]
}
```

### **NEW System (Clean)** ✅

```
Presets {
  stats: {
    health: { name: "Health", min: 1, max: 100, default: 50 }
    strength: { name: "Strength", min: 1, max: 20, default: 10 }
    magic: { name: "Magic", min: 1, max: 20, default: 10 }
  }
  variables: { questStarted: false, coins: 0 }
  profiles: [
    {
      id: "warrior",
      name: "Warrior",
      stats: { health: 80, strength: 18, magic: 5 },
      inventory: ["sword", "shield"]
    },
    {
      id: "mage",
      name: "Mage", 
      stats: { health: 50, strength: 8, magic: 18 },
      inventory: ["staff", "spellbook"]
    }
  ]
}

Items Array: [{ id: "sword", ... }, { id: "staff", ... }]  // ← Single source
Enemies Array: [{ id: "goblin", stats: {...} }]            // ← Single source

Player {
  creationMode: "both",              // ← How players create characters
  allowCustomName: true,
  useStats: ["health", "strength", "magic"], // ← Which stats to use
  startingItems: [],                 // ← Default items (if no profile)
  defaultProfile: "warrior"          // ← Optional default
}
```

---

## Detailed Type Definitions

### **StatPreset**

```typescript
interface StatPreset {
  name: string;           // Display name (e.g., "Health")
  min: number;            // Minimum value
  max: number;            // Maximum value
  default: number;        // Default value
  description?: string;   // Optional description
}
```

### **CharacterProfile**

```typescript
interface CharacterProfile {
  id: string;                      // Profile ID (e.g., "warrior")
  name: string;                    // Display name (e.g., "Warrior")
  description?: string;             // Optional description
  stats: Record<string, number>;    // Stat values from presets
  inventory?: string[];             // Starting items (item IDs)
  variables?: Record<string, any>;  // Starting variables
}
```

### **PlayerConfig**

```typescript
interface PlayerConfig {
  creationMode?: 'sliders' | 'profiles' | 'both';
  allowCustomName?: boolean;
  totalStatPoints?: number;         // For point-buy system
  useStats?: string[];              // Which stats from presets to use
  defaultProfile?: string;          // Default profile if no creation
  startingItems?: string[];         // Default items
  startingVariables?: Record<string, any>;
}
```

---

## Workflow: Author → Reader

### **1. Author Defines Stats (Presets Tab)**

Author creates stat definitions:

```typescript
{
  health: { name: "Health", min: 1, max: 100, default: 50 },
  strength: { name: "Strength", min: 1, max: 20, default: 10 },
  magic: { name: "Magic", min: 1, max: 20, default: 10 }
}
```

### **2. Author Creates Profiles (Presets Tab)**

Author creates premade character templates:

```typescript
profiles: [
  {
    id: "warrior",
    name: "Warrior",
    description: "A strong fighter with high health",
    stats: { health: 80, strength: 18, magic: 5 },
    inventory: ["sword", "shield", "health_potion"]
  },
  {
    id: "mage",
    name: "Mage",
    description: "A spellcaster with powerful magic",
    stats: { health: 50, strength: 8, magic: 18 },
    inventory: ["staff", "spellbook", "mana_potion"]
  }
]
```

### **3. Author Configures Player Setup (Player Tab)**

Author chooses character creation mode:

```typescript
player: {
  creationMode: "both",              // Players can choose OR customize
  allowCustomName: true,              // Allow naming character
  useStats: ["health", "strength", "magic"],  // Use all 3 stats
  totalStatPoints: 50,                // Optional: point-buy system
  startingItems: ["map"],             // Everyone gets a map
  defaultProfile: "warrior"           // Default if creation skipped
}
```

### **4. Reader Plays & Creates Character**

When reader loads the JSON:

**Option A: Slider Mode** (if `creationMode: "sliders"` or `"both"`)
- Sliders appear for each stat in `useStats`
- Range: `min` to `max` from stat presets
- If `totalStatPoints` is set, must distribute points within limit
- Can enter custom name if `allowCustomName: true`

**Option B: Profile Selection** (if `creationMode: "profiles"` or `"both"`)
- List of profiles shown with descriptions
- Each profile shows its stats and starting items
- Can enter custom name if `allowCustomName: true`

**Option C: Both** (if `creationMode: "both"`)
- Player chooses: "Select a preset" OR "Customize"
- Preset: Pick from profiles
- Customize: Use sliders to assign stats

### **5. Character Name in Saves**

If `allowCustomName: true`:
- Player enters name during character creation
- Name is stored in the save file
- Can be used throughout the story with placeholders like `{playerName}`

---

## Examples

### **Example 1: Fighting Fantasy Style**

```typescript
// Presets
presets: {
  stats: {
    skill: { name: "SKILL", min: 1, max: 12, default: 6 },
    stamina: { name: "STAMINA", min: 1, max: 24, default: 12 },
    luck: { name: "LUCK", min: 1, max: 12, default: 6 }
  },
  profiles: []  // No profiles - use sliders only
}

// Player
player: {
  creationMode: "sliders",
  allowCustomName: false,
  useStats: ["skill", "stamina", "luck"]
}
```

### **Example 2: Class-Based RPG**

```typescript
// Presets
presets: {
  stats: {
    health: { name: "Health", min: 50, max: 100, default: 75 },
    attack: { name: "Attack", min: 5, max: 25, default: 15 },
    defense: { name: "Defense", min: 5, max: 25, default: 15 },
    speed: { name: "Speed", min: 5, max: 20, default: 12 }
  },
  profiles: [
    { id: "tank", name: "Tank", stats: { health: 100, attack: 10, defense: 25, speed: 8 } },
    { id: "assassin", name: "Assassin", stats: { health: 60, attack: 22, defense: 8, speed: 20 } },
    { id: "balanced", name: "Balanced", stats: { health: 80, attack: 15, defense: 15, speed: 14 } }
  ]
}

// Player
player: {
  creationMode: "profiles",  // Profile selection only
  allowCustomName: true,
  useStats: ["health", "attack", "defense", "speed"]
}
```

### **Example 3: Flexible System**

```typescript
// Presets
presets: {
  stats: {
    str: { name: "Strength", min: 3, max: 18, default: 10 },
    dex: { name: "Dexterity", min: 3, max: 18, default: 10 },
    int: { name: "Intelligence", min: 3, max: 18, default: 10 }
  },
  profiles: [
    { id: "fighter", name: "Fighter", stats: { str: 16, dex: 12, int: 8 } },
    { id: "rogue", name: "Rogue", stats: { str: 10, dex: 16, int: 10 } },
    { id: "wizard", name: "Wizard", stats: { str: 8, dex: 10, int: 16 } }
  ]
}

// Player
player: {
  creationMode: "both",           // Choose preset OR customize
  allowCustomName: true,
  totalStatPoints: 36,            // Point-buy: must total 36
  useStats: ["str", "dex", "int"]
}
```

---

## Benefits of New System

✅ **No Redundancy**: Items and enemies defined once in their respective arrays
✅ **Clear Separation**: Presets define "what's available", Player defines "how it's used"
✅ **Flexible Creation**: Support sliders, profiles, or both
✅ **Reusable Profiles**: Premade characters with stats + items
✅ **Point-Buy Support**: Optional stat point pools
✅ **Named Characters**: Players can name their characters for immersion
✅ **Easy for Authors**: Clear workflow from stats → profiles → player config
✅ **Easy for Readers**: Intuitive character creation with sliders or presets

---

## Migration Guide

### **Old Format → New Format**

**OLD:**
```json
{
  "player": {
    "stats": { "SKILL": 10, "STAMINA": 20 },
    "inventory": ["sword"]
  }
}
```

**NEW:**
```json
{
  "presets": {
    "stats": {
      "skill": { "name": "SKILL", "min": 1, "max": 12, "default": 6 },
      "stamina": { "name": "STAMINA", "min": 1, "max": 24, "default": 12 }
    },
    "profiles": [
      {
        "id": "default",
        "name": "Default Character",
        "stats": { "skill": 10, "stamina": 20 },
        "inventory": ["sword"]
      }
    ]
  },
  "player": {
    "creationMode": "profiles",
    "useStats": ["skill", "stamina"],
    "defaultProfile": "default"
  }
}
```

---

## UI Components

### **PresetsEditor** (3 Tabs)
1. **Stats Tab**: Define stat types with ranges
2. **Variables Tab**: Global story variables
3. **Profiles Tab**: Create character profiles with stats + items

### **PlayerEditor** (Configuration)
1. **Character Creation**: Choose sliders/profiles/both
2. **Stats Selection**: Which stats to use
3. **Starting Items**: Default items for all characters
4. **Default Profile**: Fallback if creation skipped

---

## Summary

The refactored system provides:
- **Clear data flow**: Presets → Player Config → Character Creation
- **No duplication**: Items/Enemies in one place
- **Flexibility**: Support multiple character creation styles
- **Author-friendly**: Easy to set up and understand
- **Player-friendly**: Intuitive character creation

All TypeScript types updated, editors refactored, and integration complete! 🚀
