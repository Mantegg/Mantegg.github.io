import { GamebookData, ValidationResult, ValidationError, Choice, Page, SectionPage } from '@/types/gamebook';

/**
 * Early validation to catch fundamental JSON structure issues.
 * This runs BEFORE detailed validation and fails fast with clear messages.
 */
export function validateGamebookStructure(data: unknown): { valid: boolean; error?: string } {
  // Must be an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { valid: false, error: 'Invalid gamebook file: expected one root object.' };
  }

  const obj = data as Record<string, unknown>;

  // Check for pages array
  if (obj.pages !== undefined) {
    if (!Array.isArray(obj.pages)) {
      return { valid: false, error: 'Invalid gamebook file: "pages" must be an array.' };
    }
    if (obj.pages.length === 0) {
      return { valid: false, error: 'Invalid gamebook file: "pages" array cannot be empty.' };
    }
    // Validate each page has required fields
    for (let i = 0; i < obj.pages.length; i++) {
      const page = obj.pages[i];
      if (!page || typeof page !== 'object') {
        return { valid: false, error: `Invalid gamebook file: page at index ${i} is not an object.` };
      }
      const p = page as Record<string, unknown>;
      if (p.id === undefined) {
        return { valid: false, error: `Invalid gamebook file: page at index ${i} is missing "id".` };
      }
      if (typeof p.text !== 'string') {
        return { valid: false, error: `Invalid gamebook file: page ${p.id} is missing "text" or it's not a string.` };
      }
      if (!Array.isArray(p.choices)) {
        return { valid: false, error: `Invalid gamebook file: page ${p.id} is missing "choices" array.` };
      }
    }
    return { valid: true };
  }

  // Check for sections as full pages (new format)
  if (obj.sections !== undefined) {
    if (!Array.isArray(obj.sections)) {
      return { valid: false, error: 'Invalid gamebook file: "sections" must be an array.' };
    }
    if (obj.sections.length === 0) {
      return { valid: false, error: 'Invalid gamebook file: "sections" array cannot be empty.' };
    }
    
    // Check if sections are full page objects (have text or choices)
    const firstSection = obj.sections[0] as Record<string, unknown>;
    if ('text' in firstSection || 'choices' in firstSection) {
      // This is the new format where sections are pages
      for (let i = 0; i < obj.sections.length; i++) {
        const section = obj.sections[i] as Record<string, unknown>;
        if (section.id === undefined) {
          return { valid: false, error: `Invalid gamebook file: section at index ${i} is missing "id".` };
        }
      }
      return { valid: true };
    }
  }

  // No valid pages source found
  return { valid: false, error: 'Invalid gamebook file: expected a "pages" array with valid page objects.' };
}

/**
 * Detailed validation that checks for semantic issues like missing references.
 */
export function validateGamebook(data: GamebookData): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Normalize pages (handle both formats)
  const pages = getPages(data);
  
  // Collect all declared identifiers (optional - only if defined)
  // Stats are now simple Record<string, number> - no presets
  const declaredVariables = new Set(Object.keys(data.presets?.variables || data.player?.variables || {}));
  const declaredItems = new Set<string>();
  
  // Collect items from array format
  if (data.items) {
    if (Array.isArray(data.items)) {
      data.items.forEach(item => declaredItems.add(item.id));
    } else {
      // Object format: items: { "item_id": { name: "...", ... } }
      Object.keys(data.items).forEach(id => declaredItems.add(id));
    }
  }
  // Collect items from preset format
  if (data.presets?.items) {
    Object.keys(data.presets.items).forEach(id => declaredItems.add(id));
  }
  
  const pageIds = new Set<string | number>();
  const referencedPageIds = new Set<string | number>();
  const bookmarkIds = new Set<string>();
  const referencedBookmarks = new Set<string>();

  // Check for duplicate page IDs and collect bookmarks
  for (const page of pages) {
    const pageId = String(page.id);
    if (pageIds.has(pageId)) {
      errors.push({
        type: 'error',
        message: `Duplicate page ID: ${page.id}`,
        context: `Page "${page.text.substring(0, 50)}..."`
      });
    }
    pageIds.add(pageId);
    
    // Collect bookmarks
    if (page.bookmark) {
      bookmarkIds.add(page.bookmark);
    }
  }

  // Validate each page
  for (const page of pages) {
    // Validate page effects
    if (page.effects) {
      validateEffects(page.effects, declaredVariables, declaredItems, errors, `Page ${page.id}`);
    }

    // Validate choices
    for (const choice of page.choices) {
      // Collect referenced page IDs
      if (choice.nextPageId !== undefined) referencedPageIds.add(choice.nextPageId);
      if (choice.to !== undefined) referencedPageIds.add(choice.to);
      if (choice.failurePageId !== undefined) referencedPageIds.add(choice.failurePageId);
      
      // Collect bookmark references
      if (choice.toBookmark) {
        referencedBookmarks.add(choice.toBookmark);
      }

      // Validate choice conditions
      if (choice.conditions) {
        validateConditions(choice.conditions, declaredVariables, declaredItems, errors, `Page ${page.id}, choice "${choice.text}"`);
      }

      // Validate choice requires (new format)
      if (choice.requires) {
        validateRequires(choice.requires, declaredVariables, declaredItems, errors, `Page ${page.id}, choice "${choice.text}"`);
      }

      // Validate choice effects
      if (choice.effects) {
        validateEffects(choice.effects, declaredVariables, declaredItems, errors, `Page ${page.id}, choice "${choice.text}"`);
      }

      // Validate legacy requiresItem
      if (choice.requiresItem && declaredItems.size > 0 && !declaredItems.has(choice.requiresItem)) {
        errors.push({
          type: 'warning',
          message: `Item "${choice.requiresItem}" not declared in presets`,
          context: `Page ${page.id}, choice "${choice.text}"`
        });
      }
    }
  }

  // Check for missing page references
  for (const refId of referencedPageIds) {
    const refIdStr = String(refId);
    let found = false;
    for (const pageId of pageIds) {
      if (String(pageId) === refIdStr) {
        found = true;
        break;
      }
    }
    if (!found) {
      errors.push({
        type: 'error',
        message: `Referenced page ID "${refId}" does not exist`,
      });
    }
  }

  // Check for missing bookmark references
  for (const bookmark of referencedBookmarks) {
    if (!bookmarkIds.has(bookmark)) {
      errors.push({
        type: 'error',
        message: `Referenced bookmark "${bookmark}" does not exist`,
      });
    }
  }

  // Validate starting items
  const startingItems = data.player?.startingItems || data.player?.inventory || [];
  for (const itemId of startingItems) {
    if (declaredItems.size > 0 && !declaredItems.has(itemId)) {
      errors.push({
        type: 'warning',
        message: `Starting item "${itemId}" not declared in presets`,
        context: 'Player configuration'
      });
    }
  }

  return {
    valid: errors.filter(e => e.type === 'error').length === 0,
    errors
  };
}

function getPages(data: GamebookData): Page[] {
  if (data.pages && data.pages.length > 0) {
    return data.pages;
  }
  if (data.sections && data.sections.length > 0) {
    const firstSection = data.sections[0];
    if ('text' in firstSection || 'choices' in firstSection) {
      return (data.sections as SectionPage[]).map(section => ({
        id: section.id,
        section: section.id,
        title: section.title || section.name,
        text: section.text || '',
        choices: section.choices || [],
        bookmark: section.bookmark,
        image: section.image,
        effects: section.effects,
        ending: section.ending,
      }));
    }
  }
  return [];
}

function validateEffects(
  effects: NonNullable<Page['effects']>,
  declaredVariables: Set<string>,
  declaredItems: Set<string>,
  errors: ValidationError[],
  context: string
) {
  // Stats are now dynamic - no validation needed for stat names
  // They're just Record<string, number>

  if (effects.variables) {
    for (const varName of Object.keys(effects.variables)) {
      if (declaredVariables.size > 0 && !declaredVariables.has(varName)) {
        errors.push({
          type: 'warning',
          message: `Variable "${varName}" not declared in presets`,
          context
        });
      }
    }
  }

  if (effects.itemsAdd) {
    for (const itemId of effects.itemsAdd) {
      if (declaredItems.size > 0 && !declaredItems.has(itemId)) {
        errors.push({
          type: 'warning',
          message: `Item "${itemId}" not declared in presets`,
          context
        });
      }
    }
  }

  if (effects.itemsRemove) {
    for (const itemId of effects.itemsRemove) {
      if (declaredItems.size > 0 && !declaredItems.has(itemId)) {
        errors.push({
          type: 'warning',
          message: `Item "${itemId}" not declared in presets`,
          context
        });
      }
    }
  }
}

function validateConditions(
  conditions: NonNullable<Choice['conditions']>,
  declaredVariables: Set<string>,
  declaredItems: Set<string>,
  errors: ValidationError[],
  context: string
) {
  // Stats conditions don't need validation - dynamic stats

  if (conditions.variables) {
    for (const varName of Object.keys(conditions.variables)) {
      if (declaredVariables.size > 0 && !declaredVariables.has(varName)) {
        errors.push({
          type: 'warning',
          message: `Variable "${varName}" not declared in presets`,
          context
        });
      }
    }
  }

  if (conditions.items) {
    for (const itemId of conditions.items) {
      if (declaredItems.size > 0 && !declaredItems.has(itemId)) {
        errors.push({
          type: 'warning',
          message: `Item "${itemId}" not declared in presets`,
          context
        });
      }
    }
  }
}

function validateRequires(
  requires: NonNullable<Choice['requires']>,
  declaredVariables: Set<string>,
  declaredItems: Set<string>,
  errors: ValidationError[],
  context: string
) {
  // Stats don't need validation - dynamic

  if (requires.variables) {
    for (const varName of Object.keys(requires.variables)) {
      if (declaredVariables.size > 0 && !declaredVariables.has(varName)) {
        errors.push({
          type: 'warning',
          message: `Variable "${varName}" not declared in presets`,
          context
        });
      }
    }
  }

  if (requires.items) {
    for (const itemId of requires.items) {
      if (declaredItems.size > 0 && !declaredItems.has(itemId)) {
        errors.push({
          type: 'warning',
          message: `Item "${itemId}" not declared in presets`,
          context
        });
      }
    }
  }
}
