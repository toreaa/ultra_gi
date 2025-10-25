import * as SQLite from 'expo-sqlite';
import { Program } from '../types/database';
import { ProgramRepository } from '../database/repositories/ProgramRepository';

export interface ProgramRecommendation {
  program: Program;
  reasoning: string;
}

/**
 * Get recommended program based on user's GI issue
 *
 * For MVP, all GI issues map to the "4-Week Base Carb Training" program (ID=1).
 * Reasoning text is customized based on the specific GI issue.
 */
export async function getRecommendedProgram(
  db: SQLite.SQLiteDatabase,
  giIssue: string
): Promise<ProgramRecommendation> {
  // For MVP, all issues map to program ID 1
  const program = await ProgramRepository.getById(db, 1);

  if (!program) {
    throw new Error('Default program not found. Database may not be initialized.');
  }

  // Map GI issues to customized reasoning
  const reasoningMap: Record<string, string> = {
    kvalme:
      'Dette programmet starter med lav intensitet (30g/t) som reduserer sjansen for kvalme. Progressiv økning lar kroppen tilpasse seg gradvis.',
    kramper:
      'Programmet fokuserer på å bygge toleranse sakte, noe som hjelper mot kramper. Start lavt og bygg opp over 4 uker.',
    oppblåsthet:
      'Ved å starte med lave mengder karbohydrater og øke gradvis, gir du magen tid til å tilpasse seg uten oppblåsthet.',
    diaré:
      'Dette programmet starter forsiktig med 30g/t og lar fordøyelsessystemet venne seg til karbohydratinntak under aktivitet.',
  };

  // Normalize GI issue to lowercase for matching
  const normalizedIssue = giIssue.toLowerCase();

  // Get reasoning or use default for "annet" or unrecognized issues
  const reasoning =
    reasoningMap[normalizedIssue] ||
    'Dette grunnleggende programmet er et trygt utgangspunkt for alle som ønsker å forbedre karbohydrat-toleransen sin.';

  return {
    program,
    reasoning,
  };
}

/**
 * Get start intensity for a program
 * Helper function to extract first session's carb rate
 */
export async function getProgramStartIntensity(
  db: SQLite.SQLiteDatabase,
  programId: number
): Promise<number> {
  const sessions = await ProgramRepository.getProgramSessions(db, programId);

  if (sessions.length === 0) {
    return 30; // Default fallback
  }

  // Return first session's carb rate
  return sessions[0].carb_rate_g_per_hour;
}
