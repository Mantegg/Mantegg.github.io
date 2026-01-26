# Story ID System - Documentation

## Overview

The story ID system ensures that save files are **uniquely tied to specific story JSON files**, preventing save conflicts and accidental loading of incompatible saves.

## What is Story ID?

A **storyId** is a unique identifier (typically a UUID) that distinguishes one story from another, even if they have the same title.

## Why is it Important?

### Without storyId:
```json
// story1.json
{ "meta": { "title": "My Adventure" } }

// story2.json (completely different story!)
{ "meta": { "title": "My Adventure" } }
```
❌ Both would share saves!

### With storyId:
```json
// story1.json
{ "meta": { "title": "My Adventure", "storyId": "550e8400-..." } }

// story2.json  
{ "meta": { "title": "My Adventure", "storyId": "660f9511-..." } }
```
✅ Each has separate saves!

## Usage

### Adding storyId to Your Story

Add a `storyId` field to your story's `meta` object:

```json
{
  "meta": {
    "title": "My Epic Adventure",
    "author": "Your Name",
    "version": "1.0",
    "storyId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### Generating a UUID

You can generate a UUID using:

**Online:**
- https://www.uuidgenerator.net/
- https://www.guidgenerator.com/

**Command Line:**
```bash
# Linux/Mac
uuidgen

# Node.js
node -e "console.log(require('crypto').randomUUID())"

# Python
python -c "import uuid; print(uuid.uuid4())"

# PowerShell
[guid]::NewGuid()
```

**JavaScript (in browser console):**
```javascript
crypto.randomUUID()
```

### Example UUIDs for Testing

Test stories in this project use these UUIDs:
- `complete-features-test.json`: `550e8400-e29b-41d4-a716-446655440001`
- `comprehensive-test.json`: `550e8400-e29b-41d4-a716-446655440000`
- `story_spec_v1.json`: `550e8400-e29b-41d4-a716-446655440002`
- `sample-template`: `550e8400-e29b-41d4-a716-446655440999`

## How It Works

### Saving
1. When player saves, `storyId` is stored in the save slot
2. If story has no `storyId`, generates a legacy ID: `legacy-{title}`

### Loading
1. System gets all saves from localStorage
2. Filters to show only saves matching current story's `storyId`
3. Verifies `storyId` match before loading
4. Rejects saves from different stories

### Example Save Slot
```json
{
  "id": 1,
  "name": "My Save",
  "storyId": "550e8400-e29b-41d4-a716-446655440001",
  "storyTitle": "Complete Feature Test - Enhanced",
  "currentPageId": 15,
  "...": "other data"
}
```

## Backward Compatibility

### Legacy Stories (without storyId)
- Old stories without `storyId` still work
- System generates fallback ID: `legacy-{title}`
- Can still load old saves based on title matching

### Migration Path
Stories can add `storyId` at any time:
1. Add unique `storyId` to `meta`
2. Old saves with matching title still load (legacy mode)
3. New saves use proper `storyId`

## Best Practices

### DO:
✅ Generate a **new UUID** for each unique story
✅ Keep the **same storyId** across versions of the same story
✅ Use **version field** to track story updates
✅ Add storyId to all **new stories**

### DON'T:
❌ Reuse storyIds between different stories
❌ Change storyId when updating an existing story
❌ Use predictable/sequential IDs (use proper UUIDs)
❌ Copy storyIds from example stories

## Version Management

Use storyId + version together:

```json
{
  "meta": {
    "title": "My Adventure",
    "storyId": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.0"  // Update this when you change story
  }
}
```

- **Same storyId** = Same story (saves compatible)
- **Different version** = Updated story (track changes)
- **Different storyId** = Different story (separate saves)

## Technical Implementation

### Type Definition
```typescript
interface GameMeta {
  title?: string;
  author?: string;
  version?: string;
  storyId?: string; // UUID v4 recommended
}

interface SaveSlot {
  id: number;
  name: string;
  storyId: string;     // Required for save isolation
  storyTitle: string;  // Display purposes only
  // ... other fields
}
```

### Key Functions
- `getSaveSlots()` - Filters saves by current story's storyId
- `saveGame()` - Stores storyId with save
- `loadGame()` - Verifies storyId before loading
- `deleteSave()` - Removes save from global store

## Troubleshooting

### "Cannot load save from different story" Error
**Cause:** Trying to load a save from a different story

**Solutions:**
1. Load the correct story JSON file first
2. Or start a new game in current story

### Multiple Stories Have Same Saves
**Cause:** Stories have identical storyId or no storyId

**Solution:** Add unique storyId to each story's meta

### Old Saves Not Loading
**Cause:** Story now has storyId, old saves don't

**Solution:** 
- Old saves match by title (legacy mode)
- If title changed, old saves won't load
- Keep original title or manually migrate saves

## FAQ

**Q: Is storyId required?**
A: No, but highly recommended for multi-story projects.

**Q: Can I change storyId?**
A: Not recommended. Old saves won't load. Only change if intentional.

**Q: What format should storyId use?**
A: UUID v4 (random) is recommended. Example: `550e8400-e29b-41d4-a716-446655440000`

**Q: Can multiple versions share storyId?**
A: Yes! Same story, different versions should share storyId so saves work across versions.

**Q: How do I test with multiple stories?**
A: Each test story needs unique storyId. Use online UUID generator.

## Example: Complete Story Setup

```json
{
  "meta": {
    "title": "The Lost Kingdom",
    "author": "Jane Doe",
    "version": "2.1",
    "storyId": "a1b2c3d4-e5f6-4789-abcd-ef0123456789"
  },
  "player": {
    "stats": { "Health": 100 }
  },
  "pages": [
    {
      "id": 1,
      "text": "Your adventure begins...",
      "choices": []
    }
  ]
}
```

Now saves for "The Lost Kingdom" will never conflict with other stories! 🎉
