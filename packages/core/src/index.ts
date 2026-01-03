// @anki-splitter/core - Main entry point

// Anki exports
export {
  ankiConnect,
  getVersion,
  getProfiles,
  getDeckNames,
  getModelNames,
  getModelFieldNames,
  findNotes,
  getNotesInfo,
  updateNoteFields,
  addNote,
  addNotes,
  addTags,
  deleteNotes,
  sync,
  type NoteInfo,
  type NoteFields,
} from './anki/client.js';

export {
  getDeckNotes,
  getNoteById,
  updateMainCard,
  addSplitCards,
  applySplitResult,
  extractTextField,
  extractTags,
  type SplitCard,
  type SplitResult,
} from './anki/operations.js';

export {
  createBackup,
  preBackup,
  updateBackupWithCreatedNotes,
  rollback,
  listBackups,
  getLatestBackupId,
  type BackupEntry,
} from './anki/backup.js';

export {
  getCardSchedulingInfo,
  getFullCardInfo,
  findCardsByNote,
  setCardScheduling,
  copySchedulingToNewCards,
  cloneSchedulingAfterSplit,
  type CardSchedulingInfo,
  type FullCardInfo,
} from './anki/scheduling.js';

// Gemini exports
export {
  requestCardSplit,
  requestBatchCardSplit,
  analyzeCardForSplit,
  type CardForSplit,
} from './gemini/client.js';

export {
  SYSTEM_PROMPT,
  buildSplitPrompt,
  buildAnalysisPrompt,
} from './gemini/prompts.js';

export {
  validateSplitResponse,
  validateAnalysisResponse,
  validateClozePresence,
  validateAllCardsHaveCloze,
  validateStylePreservation,
  type SplitResponse,
  type AnalysisResponse,
} from './gemini/validator.js';

// Parser exports
export * from './parser/index.js';

// Splitter exports
export * from './splitter/index.js';

// Utils exports (excluding validateStylePreservation which conflicts with gemini/validator)
export {
  extractStyles,
  decodeHtmlEntities,
  encodeHtmlEntities,
  normalizeLineBreaks,
  cleanupEmptyLines,
  normalizeCardTitle,
  extractImagePaths,
  isValidImagePath,
} from './utils/formatters.js';

export {
  createLineDiff,
  createWordDiff,
  printSplitPreview,
  printBatchAnalysis,
  printProgress,
  type DiffResult,
} from './utils/diff-viewer.js';
