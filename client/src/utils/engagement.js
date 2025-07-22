import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

export async function getWeeklyEngagement() {
  const today = new Date();

  // Calculate the start of the current week (Sunday)
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // Helper to convert a date to YYYY-MM-DD string
  const toDayString = (dateStr) =>
    new Date(dateStr).toISOString().split('T')[0];

  return Promise.all([
    axiosInstance.get(`/api/mood-logs?from=${startOfWeek.toISOString()}`),
    axiosInstance.get(`/api/journal?from=${startOfWeek.toISOString()}`)
  ])
    .then(([moodRes, journalRes]) => {
      // Count unique days with mood logs this week
      const moodDays = new Set(
        moodRes.data.map((log) => toDayString(log.createdAt))
      );

      // Count unique days with journal entries this week
      const journalDays = new Set();
      journalRes.data.forEach((entry) =>
        journalDays.add(toDayString(entry.createdAt))
      );

      // Calculate total engagement based on mood logs and journal entries
      const totalLogs = moodDays.size + journalDays.size;

      // Total possible logs for the week is 14 (100%)
      const maxWeeklyLogs = 14;
      // The target for 65% is 9 logs
      const targetWeeklyLogs = 9;

      // Calculate percentage based on total logs out of 14 possible logs
      const percentage = Math.min(totalLogs / maxWeeklyLogs, 1);

      // Calculate logs remaining to reach the 65% threshold
      const logsRemaining = Math.max(0, targetWeeklyLogs - totalLogs);

      return {
        percentage,
        logsRemaining,
        totalLogs,
        targetWeeklyLogs
      };
    })
    .catch(() => {
      toast.error('Could not load engagement data');
      return {
        percentage: 0,
        logsRemaining: 9,
        totalLogs: 0,
        targetWeeklyLogs: 9
      };
    });
}
