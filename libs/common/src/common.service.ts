import { Injectable, Logger } from '@nestjs/common';
import * as fuzzballImport from 'fuzzball';
const fuzzball = fuzzballImport as any;

@Injectable()
export class CommonService {
  private readonly logger = new Logger(CommonService.name);

  // Normalize name by removing salutations and extra spaces
  normalizeName(name: string): string {
    if (!name) return '';

    // Convert to uppercase
    let normalized = name.toUpperCase();

    // Remove common salutations and prefixes
    const prefixes = [
      'MR.',
      'MRS.',
      'MS.',
      'DR.',
      'M/S.',
      'PROF.',
      'SHRI.',
      'SMT.',
    ];
    for (const prefix of prefixes) {
      if (normalized.startsWith(prefix)) {
        normalized = normalized.substring(prefix.length).trim();
      }
      // Also check without dot
      const prefixNoDot = prefix.replace('.', '');
      if (normalized.startsWith(prefixNoDot)) {
        normalized = normalized.substring(prefixNoDot.length).trim();
      }
    }

    // Remove special characters, multiple spaces, keep only alphanumeric
    normalized = normalized.replace(/[^A-Z0-9\s]/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  // Calculate similarity between two strings
  calculateSimilarity(str1: string, str2: string): number {
    return fuzzball.ratio(str1, str2);
  }

  // Find best match from a list of known names
  findBestMatch(
    queryName: string,
    knownNames: string[],
    threshold: number = 85,
  ): { match: string | null; score: number } {
    const normalizedQuery = this.normalizeName(queryName);

    if (!knownNames || knownNames.length === 0) {
      return { match: null, score: 0 };
    }

    const results = fuzzball.extract(normalizedQuery, knownNames, {
      scorer: fuzzball.ratio,
      limit: 1,
    });

    if (results && results.length > 0) {
      const [match, score] = results[0];
      if (score >= threshold) {
        return { match, score };
      }
      return { match: null, score };
    }

    return { match: null, score: 0 };
  }
}
