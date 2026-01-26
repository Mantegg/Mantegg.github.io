# EGameBook - Interactive Gamebook Engine

A modern, feature-rich web-based gamebook engine built with React and TypeScript. Create and play interactive narrative adventures with RPG elements, branching storylines, and rich gameplay mechanics.

## 🎮 What is EGameBook?

EGameBook is a JSON-driven interactive fiction platform that lets you create and experience text-based adventure games with:
- **Dynamic storylines** with branching choices
- **RPG mechanics** including stats, inventory, and combat
- **Save/Load system** with multiple save slots
- **Shop & market system** for trading items
- **Combat encounters** with manual resolution
- **Consumable items** with immediate effects
- **Theme customization** for personalized reading experience

Perfect for game designers, writers, and players who love interactive storytelling!

## ✨ Core Features

### 📖 Story Management
- **JSON-based stories**: Easy to create and share
- **Multi-story support**: Load different adventures from JSON files
- **Story ID system**: Isolated saves per story (no conflicts!)
- **Version control**: Track story versions in metadata
- **Comprehensive validation**: Built-in story format validation

### 🎯 Gameplay Mechanics

#### Character System
- **Customizable stats**: SKILL, STAMINA, LUCK, or any custom attributes
- **Dynamic stat changes**: Choices can modify player stats
- **Stat limits**: Min/max boundaries with overflow/underflow handling
- **Initial character setup**: Configure starting values

#### Inventory System
- **Item collection**: Gain items through choices or shops
- **Item loss**: Remove items from inventory
- **Item descriptions**: Hover tooltips with detailed info
- **Consumable items**: Click to use items with immediate effects
- **Visual indicators**: Pills icon for consumables
- **Inventory persistence**: Saves with game state

#### Combat System
- **Enemy definitions**: Flexible stat structures for enemies
- **Manual combat resolution**: Players input battle results
- **Win/Lose branching**: Different outcomes based on results
- **Combat effects**: Apply stat changes after victory
- **Enemy display**: View enemy stats during encounters

#### Shop & Market System
- **Currency system**: Use variables (gold, coins, etc.) as currency
- **Item purchasing**: Buy items with currency
- **Stock tracking**: Limited quantity items
- **Affordability checks**: Visual indicators for purchasable items
- **Price display**: Clear pricing for all items
- **Shop persistence**: Stock updates save with game state

### 💾 Save System
- **5 Save slots**: Multiple saves per story
- **Auto-save metadata**: Timestamp, page, stats captured
- **Quick save/load**: One-click save and load
- **Save management**: Delete unwanted saves
- **Story isolation**: Each story has separate saves (via Story ID)
- **Cross-session persistence**: Uses browser localStorage

### 🎨 User Interface

#### Reading Experience
- **Clean typography**: Optimized for long-form reading
- **Text formatting**: Bold, italic, colored text support
- **Paragraph spacing**: Proper formatting with \\n\\n
- **Choice buttons**: Clear, interactive decision points
- **History panel**: Track your journey through the story
- **Theme controls**: Light/dark mode with custom colors

#### Interactive Panels
- **Inventory panel**: View items and stats
- **History panel**: Review past choices and pages
- **Save/Load panel**: Manage game saves
- **Shop panel**: Browse and purchase items
- **Combat dialog**: Resolve battles manually

### 🎨 Customization
- **Theme system**: Light/dark mode
- **Color customization**: Adjust primary theme color
- **Responsive design**: Works on desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Technology Stack

- **React 18.3.1**: Modern UI framework with hooks
- **TypeScript 5.8.3**: Full type safety
- **Vite 5.4.19**: Lightning-fast build tool
- **shadcn/ui**: High-quality React components
- **Tailwind CSS 3.4.17**: Utility-first styling
- **React Router 6.30.1**: Client-side routing
- **localStorage**: Browser-based save persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd EGameBook

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Quick Start Guide

1. **Launch the app**: Run `npm run dev`
2. **Create a story**: Use the story template or load a sample
3. **Start playing**: Make choices and explore the narrative
4. **Save your progress**: Use save slots to preserve your game
5. **Try different stories**: Load JSON files for different adventures

## 📚 Creating Stories

### Story Structure

Stories are defined in JSON format with this structure:

```json
{
  "meta": {
    "title": "Your Story Title",
    "author": "Your Name",
    "version": "1.0",
    "storyId": "your-unique-uuid-here"
  },
  "initialStats": {
    "SKILL": 10,
    "STAMINA": 20,
    "LUCK": 12
  },
  "initialInventory": ["sword", "shield"],
  "startPage": "page-1",
  "pages": {
    "page-1": {
      "text": "Your adventure begins...",
      "choices": [
        {
          "text": "Go north",
          "nextPageId": "page-2"
        }
      ]
    }
  }
}
```

### Advanced Features

#### Item Definitions with Descriptions
```json
{
  "itemDefs": {
    "health_potion": {
      "name": "Health Potion",
      "description": "Restores 10 STAMINA",
      "consumable": true,
      "effects": [
        { "stat": "STAMINA", "change": 10 }
      ]
    }
  }
}
```

#### Shop Configuration
```json
{
  "pages": {
    "shop-page": {
      "text": "Welcome to the shop!",
      "shop": {
        "currency": "gold",
        "items": [
          {
            "itemId": "sword",
            "price": 50,
            "stock": 3
          }
        ]
      }
    }
  }
}
```

#### Combat Encounters
```json
{
  "enemyDefs": {
    "goblin": {
      "name": "Goblin",
      "SKILL": 6,
      "STAMINA": 8
    }
  },
  "pages": {
    "combat-page": {
      "text": "A goblin attacks!",
      "choices": [
        {
          "text": "Fight the goblin",
          "combat": {
            "enemyId": "goblin",
            "winPageId": "victory-page",
            "losePageId": "defeat-page"
          }
        }
      ]
    }
  }
}
```

### Test Stories Included

Three comprehensive test stories are included in `public/test-stories/`:

1. **complete-features-test.json**: Showcase of all features
   - Shop system with multiple items
   - Consumable items (potions, elixirs)
   - Combat encounters (3 enemies)
   - Item descriptions and tooltips

2. **comprehensive-test.json**: Full testing suite
   - All core mechanics
   - Edge cases and validation
   - 26 pages of content

3. **story_spec_v1.json**: Format specification reference

## 📖 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[NEW_FEATURES.md](./NEW_FEATURES.md)**: Complete technical documentation of all features
- **[FEATURES_SUMMARY.md](./FEATURES_SUMMARY.md)**: Quick reference guide
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**: How to add features to existing stories
- **[STORY_ID_GUIDE.md](./STORY_ID_GUIDE.md)**: Story ID system usage and best practices
- **[STORY_ID_IMPLEMENTATION.md](./STORY_ID_IMPLEMENTATION.md)**: Implementation summary

## 🔧 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── gamebook/       # Game-specific components
│   └── ui/             # shadcn UI components
├── contexts/           # React contexts (theme)
├── hooks/              # Custom React hooks
│   └── useGamebook.ts  # Main game logic hook
├── lib/                # Utilities
│   ├── gamebook-validator.ts
│   └── text-formatter.tsx
├── pages/              # Route pages
├── types/              # TypeScript definitions
│   └── gamebook.ts     # Core game types
└── test/               # Test files
```

### Key Files

- **`src/hooks/useGamebook.ts`**: Core game state management (820 lines)
- **`src/types/gamebook.ts`**: TypeScript type definitions for entire system
- **`src/components/gamebook/StoryReader.tsx`**: Main game interface
- **`src/lib/gamebook-validator.ts`**: Story format validation

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

## 🎯 Feature Highlights

### 1. **Story ID System** 🆔
Each story has a unique identifier preventing save conflicts:
- UUID-based identification
- Isolated saves per story
- Backward compatible with legacy stories
- Automatic legacy ID generation

### 2. **Item Descriptions** 📝
Hover over items to see detailed information:
- Tooltip displays on hover
- Shows item effects
- Describes item purpose
- Works in inventory and shops

### 3. **Consumable Items** 💊
Click items in inventory to use them:
- Immediate effect application
- Confirmation dialog
- Stat modifications
- Visual feedback

### 4. **Shop System** 🛒
Buy items using in-game currency:
- Multiple currency types supported
- Stock tracking and limits
- Affordability indicators
- Persistent purchases

### 5. **Combat Encounters** ⚔️
Manual combat resolution system:
- Display enemy stats
- Input your results
- Win/Lose branching
- Combat effects

### 6. **Save System** 💾
Robust save/load functionality:
- 5 slots per story
- Story-specific saves
- Metadata tracking
- Quick save/load

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue with details
2. **Suggest features**: Share your ideas
3. **Submit PRs**: Fork, create a branch, and submit
4. **Create stories**: Share your JSON stories
5. **Improve docs**: Help others understand the system

## 📝 License

This project is open source. See LICENSE file for details.

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Rich text editing with [TipTap](https://tiptap.dev)
- Visual flow editor with [ReactFlow](https://reactflow.dev)

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub.

## 🚀 Roadmap

Potential future features:
- [ ] Multiplayer/shared stories
- [ ] Story editor UI
- [ ] Achievement system
- [ ] Sound effects and music
- [ ] Animations and transitions
- [ ] Export/import save files
- [ ] Story analytics
- [ ] Cloud save sync

---

**Happy storytelling!** 📖✨
