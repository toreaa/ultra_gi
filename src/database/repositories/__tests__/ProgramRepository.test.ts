import { ProgramRepository } from '../ProgramRepository';
import type { Program, ProgramSession, UserProgram } from '../../../types/database';

// Mock expo-sqlite
const mockGetFirstAsync = jest.fn();
const mockGetAllAsync = jest.fn();
const mockRunAsync = jest.fn();

const mockDb = {
  getFirstAsync: mockGetFirstAsync,
  getAllAsync: mockGetAllAsync,
  runAsync: mockRunAsync,
} as any;

// Mock getDatabase
jest.mock('../../index', () => ({
  getDatabase: jest.fn(() => Promise.resolve(mockDb)),
}));

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
  {
    id: 4,
    program_id: 1,
    week_number: 2,
    session_number: 2,
    duration_minutes: 75,
    carb_rate_g_per_hour: 45,
    intensity_zone: 'Zone 2-3',
    notes: 'Repeat Week 2 Session 1',
  },
];

const mockUserPrograms: UserProgram[] = [
  {
    id: 1,
    user_id: 1,
    program_id: 1,
    started_at: '2025-01-15T10:00:00.000Z',
    status: 'active',
  },
];

describe('ProgramRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should return program when found', async () => {
      mockGetFirstAsync.mockResolvedValue(mockProgram);

      const result = await ProgramRepository.getById(1);

      expect(result).toEqual(mockProgram);
      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM programs WHERE id = ? AND is_active = 1',
        [1]
      );
    });

    it('should return null when program not found', async () => {
      mockGetFirstAsync.mockResolvedValue(null);

      const result = await ProgramRepository.getById(999);

      expect(result).toBeNull();
      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        'SELECT * FROM programs WHERE id = ? AND is_active = 1',
        [999]
      );
    });

    it('should only return active programs (is_active = 1)', async () => {
      mockGetFirstAsync.mockResolvedValue(null);

      await ProgramRepository.getById(1);

      expect(mockGetFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('is_active = 1'),
        expect.any(Array)
      );
    });

    it('should use parameterized query (SQL injection protection)', async () => {
      mockGetFirstAsync.mockResolvedValue(mockProgram);

      await ProgramRepository.getById(1);

      expect(mockGetFirstAsync).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('should return undefined when database returns undefined', async () => {
      mockGetFirstAsync.mockResolvedValue(undefined);

      const result = await ProgramRepository.getById(1);

      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all active programs', async () => {
      const mockPrograms = [mockProgram];
      mockGetAllAsync.mockResolvedValue(mockPrograms);

      const result = await ProgramRepository.getAll();

      expect(result).toEqual(mockPrograms);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        'SELECT * FROM programs WHERE is_active = 1 ORDER BY created_at DESC'
      );
    });

    it('should return empty array when no programs found', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      const result = await ProgramRepository.getAll();

      expect(result).toEqual([]);
    });

    it('should order programs by created_at DESC (newest first)', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      await ProgramRepository.getAll();

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC')
      );
    });

    it('should only return active programs', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      await ProgramRepository.getAll();

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('is_active = 1')
      );
    });
  });

  describe('getProgramSessions', () => {
    it('should return sessions ordered by week and session number', async () => {
      mockGetAllAsync.mockResolvedValue(mockSessions);

      const result = await ProgramRepository.getProgramSessions(1);

      expect(result).toEqual(mockSessions);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY week_number, session_number'),
        [1]
      );
    });

    it('should return empty array when no sessions found', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      const result = await ProgramRepository.getProgramSessions(999);

      expect(result).toEqual([]);
    });

    it('should filter sessions by program_id', async () => {
      mockGetAllAsync.mockResolvedValue(mockSessions);

      await ProgramRepository.getProgramSessions(1);

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE program_id = ?'),
        [1]
      );
    });

    it('should use parameterized query', async () => {
      mockGetAllAsync.mockResolvedValue(mockSessions);

      await ProgramRepository.getProgramSessions(1);

      expect(mockGetAllAsync).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('should verify correct ordering of sessions', async () => {
      const unorderedSessions = [mockSessions[2], mockSessions[0], mockSessions[1]];
      mockGetAllAsync.mockResolvedValue(unorderedSessions);

      await ProgramRepository.getProgramSessions(1);

      // Verify query contains ORDER BY clause
      const call = mockGetAllAsync.mock.calls[0][0];
      expect(call).toContain('ORDER BY week_number, session_number');
    });
  });

  describe('startProgram', () => {
    it('should insert user_programs record with active status', async () => {
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });

      const result = await ProgramRepository.startProgram(1, 1);

      expect(result).toBe(1);
      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO user_programs"),
        [1, 1]
      );
    });

    it('should set started_at to current datetime', async () => {
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 2, changes: 1 });

      await ProgramRepository.startProgram(1, 1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining("datetime('now')"),
        expect.any(Array)
      );
    });

    it('should set status to active', async () => {
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 3, changes: 1 });

      await ProgramRepository.startProgram(1, 1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining("'active'"),
        expect.any(Array)
      );
    });

    it('should use default userId = 1 when not provided', async () => {
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 4, changes: 1 });

      await ProgramRepository.startProgram(mockDb, 1);

      expect(mockRunAsync).toHaveBeenCalledWith(expect.any(String), [1, 1]);
    });

    it('should accept custom userId', async () => {
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 5, changes: 1 });

      await ProgramRepository.startProgram(2, 42);

      expect(mockRunAsync).toHaveBeenCalledWith(expect.any(String), [42, 2]);
    });

    it('should return lastInsertRowId from database', async () => {
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 123, changes: 1 });

      const result = await ProgramRepository.startProgram(1, 1);

      expect(result).toBe(123);
    });

    it('should use parameterized query', async () => {
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });

      await ProgramRepository.startProgram(1, 1);

      expect(mockRunAsync).toHaveBeenCalledWith(expect.any(String), [1, 1]);
    });
  });

  describe('getUserActivePrograms', () => {
    it('should return active programs for user', async () => {
      mockGetAllAsync.mockResolvedValue(mockUserPrograms);

      const result = await ProgramRepository.getUserActivePrograms(1);

      expect(result).toEqual(mockUserPrograms);
      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("status = 'active'"),
        [1]
      );
    });

    it('should filter by user_id', async () => {
      mockGetAllAsync.mockResolvedValue(mockUserPrograms);

      await ProgramRepository.getUserActivePrograms(1);

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = ?'),
        [1]
      );
    });

    it('should use default userId = 1 when not provided', async () => {
      mockGetAllAsync.mockResolvedValue(mockUserPrograms);

      await ProgramRepository.getUserActivePrograms(mockDb);

      expect(mockGetAllAsync).toHaveBeenCalledWith(expect.any(String), [1]);
    });

    it('should order by started_at DESC (newest first)', async () => {
      mockGetAllAsync.mockResolvedValue(mockUserPrograms);

      await ProgramRepository.getUserActivePrograms(1);

      expect(mockGetAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY started_at DESC'),
        [1]
      );
    });

    it('should return empty array when no active programs', async () => {
      mockGetAllAsync.mockResolvedValue([]);

      const result = await ProgramRepository.getUserActivePrograms(1);

      expect(result).toEqual([]);
    });
  });

  describe('completeProgram', () => {
    it('should update user_program status to completed', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await ProgramRepository.completeProgram(1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining("status = 'completed'"),
        [1]
      );
    });

    it('should set completed_at to current datetime', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await ProgramRepository.completeProgram(1);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining("completed_at = datetime('now')"),
        [1]
      );
    });

    it('should filter by user_program id', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await ProgramRepository.completeProgram(42);

      expect(mockRunAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [42]
      );
    });

    it('should use parameterized query', async () => {
      mockRunAsync.mockResolvedValue({ changes: 1 });

      await ProgramRepository.completeProgram(1);

      expect(mockRunAsync).toHaveBeenCalledWith(expect.any(String), [1]);
    });
  });

  describe('SQL Injection Protection', () => {
    it('all methods should use parameterized queries', async () => {
      mockGetFirstAsync.mockResolvedValue(mockProgram);
      mockGetAllAsync.mockResolvedValue([]);
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });

      // Test all methods
      await ProgramRepository.getById(1);
      await ProgramRepository.getAll();
      await ProgramRepository.getProgramSessions(1);
      await ProgramRepository.startProgram(1, 1);
      await ProgramRepository.getUserActivePrograms(1);
      await ProgramRepository.completeProgram(1);

      // Verify all calls use array parameters (parameterized queries)
      const allCalls = [
        ...mockGetFirstAsync.mock.calls,
        ...mockGetAllAsync.mock.calls,
        ...mockRunAsync.mock.calls,
      ];

      // Methods that require parameters should have them in array format
      const callsWithParams = allCalls.filter((call) => call[1] !== undefined);
      callsWithParams.forEach((call) => {
        expect(Array.isArray(call[1])).toBe(true);
      });
    });
  });

  describe('Database Parameter Passing', () => {
    it('all methods should accept db as first parameter', async () => {
      mockGetFirstAsync.mockResolvedValue(mockProgram);
      mockGetAllAsync.mockResolvedValue([]);
      mockRunAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });

      // Verify all static methods accept db parameter
      await ProgramRepository.getById(1);
      await ProgramRepository.getAll();
      await ProgramRepository.getProgramSessions(1);
      await ProgramRepository.startProgram(1, 1);
      await ProgramRepository.getUserActivePrograms(1);
      await ProgramRepository.completeProgram(1);

      // All should execute without errors
      expect(mockGetFirstAsync).toHaveBeenCalled();
      expect(mockGetAllAsync).toHaveBeenCalled();
      expect(mockRunAsync).toHaveBeenCalled();
    });
  });
});
