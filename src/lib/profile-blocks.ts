/**
 * Profile content block utilities.
 *
 * BlockType is the normalized name used in the ProfileBlock table.
 * The legacy Profile column names are kept as the source of truth for reads
 * during the dual-write transition; this map documents the correspondence.
 */

export const BLOCK_TYPE_TO_COLUMN = {
  about:     'aboutContent',
  journal:   'journalContent',
  media:     'mediaContent',
  tour:      'tourContent',
  merch:     'merchContent',
  request:   'requestContent',
  recommend: 'recommendContent',
  topfive:   'topFiveContent',
  upcoming:  'upcomingContent',
  prevshows: 'previousShowHighlights'
} as const;

export type BlockType = keyof typeof BLOCK_TYPE_TO_COLUMN;

export const ALL_BLOCK_TYPES = Object.keys(BLOCK_TYPE_TO_COLUMN) as BlockType[];

/**
 * Build an array of ProfileBlock upsert operations from a flat content map.
 * Safe to call inside a Prisma transaction.
 *
 * @example
 * const upserts = buildBlockUpserts(profileId, { about: 'Hello', tour: 'Chicago → NYC' });
 * await Promise.all(upserts.map(u => tx.profileBlock.upsert(u)));
 */
export function buildBlockUpserts(
  profileId: string,
  content: Partial<Record<BlockType, string | null | undefined>>
) {
  return (Object.entries(content) as [BlockType, string | null | undefined][])
    .filter(([, value]) => value != null && value.trim() !== '')
    .map(([blockType, value]) => ({
      where: { profileId_blockType: { profileId, blockType } },
      create: { profileId, blockType, content: value!.trim() },
      update: { content: value!.trim(), version: { increment: 1 } }
    }));
}

/**
 * Delete ProfileBlock rows for block types whose content is being cleared.
 */
export function buildBlockDeletes(
  profileId: string,
  content: Partial<Record<BlockType, string | null | undefined>>
): BlockType[] {
  return (Object.entries(content) as [BlockType, string | null | undefined][])
    .filter(([, value]) => value == null || value.trim() === '')
    .map(([blockType]) => blockType);
}

/**
 * Convert ProfileBlock rows back to the flat column shape for legacy reads.
 */
export function blocksToColumnMap(
  blocks: Array<{ blockType: string; content: string }>
): Partial<Record<(typeof BLOCK_TYPE_TO_COLUMN)[BlockType], string>> {
  const result: Partial<Record<(typeof BLOCK_TYPE_TO_COLUMN)[BlockType], string>> = {};
  for (const block of blocks) {
    const column = BLOCK_TYPE_TO_COLUMN[block.blockType as BlockType];
    if (column) result[column] = block.content;
  }
  return result;
}
