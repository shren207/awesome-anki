/**
 * 임베딩 모듈 - Gemini 기반 의미적 유사도 검사
 */

// 코사인 유사도
export {
  cosineSimilarity,
  normalizeVector,
  fastCosineSimilarity,
} from './cosine.js';

// Gemini 임베딩 클라이언트
export {
  getEmbedding,
  getEmbeddings,
  getSemanticSimilarity,
  preprocessTextForEmbedding,
  type EmbeddingOptions,
} from './client.js';

// 파일 기반 캐시
export {
  loadCache,
  saveCache,
  createCache,
  getCachedEmbedding,
  setCachedEmbedding,
  cleanupCache,
  getCacheStatus,
  deleteCache,
  getTextHash,
  type EmbeddingCache,
  type CachedEmbedding,
  type CacheStatus,
} from './cache.js';
