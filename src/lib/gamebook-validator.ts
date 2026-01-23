import { GamebookData, ValidationResult, ValidationError, Choice, Page, SectionPage } from '@/types/gamebook';

export function validateGamebook(data: GamebookData): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Normalize pages (handle both formats)
  const pages = getPages(data);
  
  // Collect all declared identifiers
  const declaredStats = new Set(Object.keys(data.presets?.stats || {}));
  const declaredVariables = new Set(Object.keys(data.presets?.variables || data.player?.variables || {}));
  const declaredItems = new Set<string>();
  
  // Collect items from array format
  if (data.items) {
    data.items.forEach(item => declaredItems.add(item.id));
  }
  // Collect items from preset format
  if (data.presets?.items) {
    Object.keys(data.presets.items).forEach(id => declaredItems.add(id));
  }
  
  const pageIds = new Set<string | number>();
  const referencedPageIds = new Set<string | number>();

  // Check for duplicate page IDs
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
  }

  // Validate each page
  for (const page of pages) {
    // Validate page effects
    if (page.effects) {
      validateEffects(page.effects, declaredStats, declaredVariables, declaredItems, errors, `Page ${page.id}`);
    }

    // Validate choices
    for (const choice of page.choices) {
      // Collect referenced page IDs
      if (choice.nextPageId !== undefined) referencedPageIds.add(choice.nextPageId);
      if (choice.to !== undefined) referencedPageIds.add(choice.to);
      if (choice.failurePageId !== undefined) referencedPageIds.add(choice.failurePageId);
      // Note: toBookmark references are validated separately against bookmarks

      // Validate choice conditions
      if (choice.conditions) {
        validateConditions(choice.conditions, declaredStats, declaredVariables, declaredItems, errors, `Page ${page.id}, choice "${choice.text}"`);
      }

      // Validate choice requires (new format)
      if (choice.requires) {
        validateRequires(choice.requires, declaredStats, declaredVariables, declaredItems, errors, `Page ${page.id}, choice "${choice.text}"`);
      }

      // Validate choice effects
      if (choice.effects) {
        validateEffects(choice.effects, declaredStats, declaredVariables, declaredItems, errors, `Page ${page.id}, choice "${choice.text}"`);
      }

      // Validate legacy requiresItem
      if (choice.requiresItem && declaredItems.size > 0 && !declaredItems.has(choice.requiresItem)) {
        errors.push({
          type: 'warning',
          message: `Item "${choice.requiresItem}" not declared in presets`,
          context: `Page ${page.id}, choice "${choice.text}"`
        });
      }

      // Validate legacy requiresStat
      if (choice.requiresStat && declaredStats.size > 0 && !declaredStats.has(choice.requiresStat.name)) {
        errors.push({
          type: 'warning',
          message: `Stat "${choice.requiresStat.name}" not declared in presets`,
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
  declaredStats: Set<string>,
  declaredVariables: Set<string>,
  declaredItems: Set<string>,
  errors: ValidationError[],
  context: string
) {
  if (effects.stats) {
    for (const statName of Object.keys(effects.stats)) {
      if (declaredStats.size > 0 && !declaredStats.has(statName)) {
        errors.push({
          type: 'warning',
          message: `Stat "${statName}" not declared in presets`,
          context
        });
      }
    }
  }

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
  declaredStats: Set<string>,
  declaredVariables: Set<string>,
  declaredItems: Set<string>,
  errors: ValidationError[],
  context: string
) {
  if (conditions.stats) {
    for (const statName of Object.keys(conditions.stats)) {
      if (declaredStats.size > 0 && !declaredStats.has(statName)) {
        errors.push({
          type: 'warning',
          message: `Stat "${statName}" not declared in presets`,
          context
        });
      }
    }
  }

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
  declaredStats: Set<string>,
  declaredVariables: Set<string>,
  declaredItems: Set<string>,
  errors: ValidationError[],
  context: string
) {
  if (requires.stats) {
    for (const statName of Object.keys(requires.stats)) {
      if (declaredStats.size > 0 && !declaredStats.has(statName)) {
        errors.push({
          type: 'warning',
          message: `Stat "${statName}" not declared in presets`,
          context
        });
      }
    }
  }

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
