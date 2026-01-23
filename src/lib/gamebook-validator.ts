import { GamebookData, ValidationResult, ValidationError, Choice, Page } from '@/types/gamebook';

export function validateGamebook(data: GamebookData): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Collect all declared identifiers
  const declaredStats = new Set(Object.keys(data.presets?.stats || {}));
  const declaredVariables = new Set(Object.keys(data.presets?.variables || {}));
  const declaredItems = new Set(Object.keys(data.presets?.items || {}));
  const pageIds = new Set<number>();
  const referencedPageIds = new Set<number>();

  // Check for duplicate page IDs
  for (const page of data.pages) {
    if (pageIds.has(page.id)) {
      errors.push({
        type: 'error',
        message: `Duplicate page ID: ${page.id}`,
        context: `Page "${page.text.substring(0, 50)}..."`
      });
    }
    pageIds.add(page.id);
  }

  // Validate each page
  for (const page of data.pages) {
    // Validate page effects
    if (page.effects) {
      validateEffects(page.effects, declaredStats, declaredVariables, declaredItems, errors, `Page ${page.id}`);
    }

    // Validate choices
    for (const choice of page.choices) {
      referencedPageIds.add(choice.nextPageId);
      
      if (choice.failurePageId !== undefined) {
        referencedPageIds.add(choice.failurePageId);
      }

      // Validate choice conditions
      if (choice.conditions) {
        validateConditions(choice.conditions, declaredStats, declaredVariables, declaredItems, errors, `Page ${page.id}, choice "${choice.text}"`);
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
    if (!pageIds.has(refId)) {
      errors.push({
        type: 'error',
        message: `Referenced page ID ${refId} does not exist`,
      });
    }
  }

  // Validate starting items
  if (data.player?.startingItems) {
    for (const itemId of data.player.startingItems) {
      if (declaredItems.size > 0 && !declaredItems.has(itemId)) {
        errors.push({
          type: 'warning',
          message: `Starting item "${itemId}" not declared in presets`,
          context: 'Player configuration'
        });
      }
    }
  }

  return {
    valid: errors.filter(e => e.type === 'error').length === 0,
    errors
  };
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
          type: 'error',
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
          type: 'error',
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
