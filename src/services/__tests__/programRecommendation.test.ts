import { getRecommendedProgram, getProgramStartIntensity } from '../programRecommendation';
import { ProgramRepository } from '../../database/repositories/ProgramRepository';
import type { Program, ProgramSession } from '../../types/database';

// Mock the ProgramRepository
jest.mock('../../database/repositories/ProgramRepository');

const mockDb = {} as any; // Mock database instance

const mockProgram: Program = {
  id: 1,
  name: '4-Week Base Carb Training',
  description:
    'Progressive carbohydrate tolerance training starting at 30g/hr, building to 60g/hr over 4 weeks.',
  duration_weeks: 4,
  target_audience: 'Endurance athletes new to carb training',
  research_source: 'Based on Jeukendrup (2014) gut training protocols',
  created_at: '2025-01-01T00:00:00.000Z',
  is_active: true,
};

const mockSessions: ProgramSession[] = [
  {
    id: 1,
    program_id: 1,
    week_number: 1,
    session_number: 1,
    duration_minutes: 60,
    carb_rate_g_per_hour: 30,
    intensity_zone: 'Zone 2',
    notes: 'Start easy, focus on tolerance',
  },
  {
    id: 2,
    program_id: 1,
    week_number: 1,
    session_number: 2,
    duration_minutes: 60,
    carb_rate_g_per_hour: 30,
    intensity_zone: 'Zone 2',
    notes: 'Repeat Week 1 Session 1',
  },
  {
    id: 3,
    program_id: 1,
    week_number: 2,
    session_number: 1,
    duration_minutes: 75,
    carb_rate_g_per_hour: 45,
    intensity_zone: 'Zone 2-3',
    notes: 'Increase duration and carb rate',
  },
];

describe('programRecommendation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendedProgram', () => {
    beforeEach(() => {
      (ProgramRepository.getById as jest.Mock).mockResolvedValue(mockProgram);
    });

    it('should recommend 4-Week Base for kvalme with customized reasoning', async () => {
      const result = await getRecommendedProgram(mockDb, 'kvalme');

      expect(result.program).toEqual(mockProgram);
      expect(result.reasoning).toContain('lav intensitet');
      expect(result.reasoning).toContain('30g/t');
      expect(result.reasoning).toContain('kvalme');
      expect(ProgramRepository.getById).toHaveBeenCalledWith(mockDb, 1);
    });

    it('should recommend 4-Week Base for kramper with customized reasoning', async () => {
      const result = await getRecommendedProgram(mockDb, 'kramper');

      expect(result.program).toEqual(mockProgram);
      expect(result.reasoning).toContain('toleranse sakte');
      expect(result.reasoning).toContain('kramper');
      expect(result.reasoning).toContain('4 uker');
    });

    it('should recommend 4-Week Base for oppblåsthet with customized reasoning', async () => {
      const result = await getRecommendedProgram(mockDb, 'oppblåsthet');

      expect(result.program).toEqual(mockProgram);
      expect(result.reasoning).toContain('lave mengder karbohydrater');
      expect(result.reasoning).toContain('oppblåsthet');
      expect(result.reasoning).toContain('gradvis');
    });

    it('should recommend 4-Week Base for diaré with customized reasoning', async () => {
      const result = await getRecommendedProgram(mockDb, 'diaré');

      expect(result.program).toEqual(mockProgram);
      expect(result.reasoning).toContain('forsiktig');
      expect(result.reasoning).toContain('30g/t');
      expect(result.reasoning).toContain('fordøyelsessystemet');
    });

    it('should provide default reasoning for unknown GI issue', async () => {
      const result = await getRecommendedProgram(mockDb, 'ukjent problem');

      expect(result.program).toEqual(mockProgram);
      expect(result.reasoning).toContain('grunnleggende programmet');
      expect(result.reasoning).toContain('trygt utgangspunkt');
      expect(result.reasoning).toContain('karbohydrat-toleransen');
    });

    it('should provide default reasoning for annet', async () => {
      const result = await getRecommendedProgram(mockDb, 'annet');

      expect(result.program).toEqual(mockProgram);
      expect(result.reasoning).toContain('grunnleggende programmet');
      expect(result.reasoning).toContain('trygt utgangspunkt');
    });

    it('should provide different reasoning for different GI issues', async () => {
      const kvalme = await getRecommendedProgram(mockDb, 'kvalme');
      const kramper = await getRecommendedProgram(mockDb, 'kramper');

      expect(kvalme.reasoning).not.toBe(kramper.reasoning);
    });

    it('should handle case-insensitive GI issue matching', async () => {
      const lowercase = await getRecommendedProgram(mockDb, 'kvalme');
      const uppercase = await getRecommendedProgram(mockDb, 'KVALME');
      const mixedCase = await getRecommendedProgram(mockDb, 'Kvalme');

      expect(lowercase.reasoning).toBe(uppercase.reasoning);
      expect(lowercase.reasoning).toBe(mixedCase.reasoning);
    });

    it('should throw error when program not found in database', async () => {
      (ProgramRepository.getById as jest.Mock).mockResolvedValue(null);

      await expect(getRecommendedProgram(mockDb, 'kvalme')).rejects.toThrow(
        'Default program not found'
      );
    });

    it('should return program recommendation interface with correct structure', async () => {
      const result = await getRecommendedProgram(mockDb, 'kvalme');

      expect(result).toHaveProperty('program');
      expect(result).toHaveProperty('reasoning');
      expect(typeof result.reasoning).toBe('string');
      expect(result.program).toHaveProperty('id');
      expect(result.program).toHaveProperty('name');
      expect(result.program).toHaveProperty('duration_weeks');
    });

    it('should always fetch program ID 1 for MVP', async () => {
      await getRecommendedProgram(mockDb, 'kvalme');
      await getRecommendedProgram(mockDb, 'kramper');
      await getRecommendedProgram(mockDb, 'oppblåsthet');

      expect(ProgramRepository.getById).toHaveBeenCalledTimes(3);
      expect(ProgramRepository.getById).toHaveBeenCalledWith(mockDb, 1);
    });
  });

  describe('getProgramStartIntensity', () => {
    it('should return first session carb rate', async () => {
      (ProgramRepository.getProgramSessions as jest.Mock).mockResolvedValue(mockSessions);

      const intensity = await getProgramStartIntensity(mockDb, 1);

      expect(intensity).toBe(30);
      expect(ProgramRepository.getProgramSessions).toHaveBeenCalledWith(mockDb, 1);
    });

    it('should return default 30 when no sessions found', async () => {
      (ProgramRepository.getProgramSessions as jest.Mock).mockResolvedValue([]);

      const intensity = await getProgramStartIntensity(mockDb, 1);

      expect(intensity).toBe(30);
    });

    it('should extract carb_rate_g_per_hour from first session', async () => {
      const customSessions: ProgramSession[] = [
        {
          id: 1,
          program_id: 2,
          week_number: 1,
          session_number: 1,
          duration_minutes: 90,
          carb_rate_g_per_hour: 60,
          intensity_zone: 'Zone 3',
          notes: 'Advanced start',
        },
      ];

      (ProgramRepository.getProgramSessions as jest.Mock).mockResolvedValue(customSessions);

      const intensity = await getProgramStartIntensity(mockDb, 2);

      expect(intensity).toBe(60);
    });

    it('should use first session even when multiple sessions exist', async () => {
      (ProgramRepository.getProgramSessions as jest.Mock).mockResolvedValue(mockSessions);

      const intensity = await getProgramStartIntensity(mockDb, 1);

      expect(intensity).toBe(30); // First session, not 45 from second week
    });
  });

  describe('Norwegian Localization', () => {
    beforeEach(() => {
      (ProgramRepository.getById as jest.Mock).mockResolvedValue(mockProgram);
    });

    it('all reasoning text should be in Norwegian', async () => {
      const giIssues = ['kvalme', 'kramper', 'oppblåsthet', 'diaré', 'annet'];

      for (const issue of giIssues) {
        const result = await getRecommendedProgram(mockDb, issue);

        // Check for English words that should not appear (note: "program" is also Norwegian)
        expect(result.reasoning).not.toContain('nausea');
        expect(result.reasoning).not.toContain('cramps');
        expect(result.reasoning).not.toContain('bloating');
        expect(result.reasoning).not.toContain('diarrhea');
        expect(result.reasoning).not.toContain('training');
      }
    });

    it('reasoning should contain Norwegian-specific words', async () => {
      const kvalme = await getRecommendedProgram(mockDb, 'kvalme');
      const kramper = await getRecommendedProgram(mockDb, 'kramper');

      // Check for Norwegian words
      expect(kvalme.reasoning).toContain('programmet');
      expect(kramper.reasoning).toContain('toleranse');
    });
  });
});
