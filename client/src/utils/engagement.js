import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

export async function getWeeklyEngagement() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6); // Inclusive range

  // Helper to convert a date to YYYY-MM-DD string
  const toDayString = (dateStr) =>
    new Date(dateStr).toISOString().split('T')[0];

  return Promise.all([
    axiosInstance.get(`/api/mood-logs?from=${sevenDaysAgo.toISOString()}`),
    axiosInstance.get(`/api/journal?from=${sevenDaysAgo.toISOString()}`)
  ])
    .then(([moodRes, journalRes]) => {
      const moodDays = new Set(
        moodRes.data.map((log) => toDayString(log.createdAt))
      );

      // Collapse journals to first-entry-per-day
      const journalDays = new Set();
      journalRes.data.forEach((entry) =>
        journalDays.add(toDayString(entry.createdAt))
      );

      const totalLogs = moodDays.size + journalDays.size;
      const percentage = totalLogs / 14;

      const requiredLogs = 9; // 65% of 14 rounded up
      const logsRemaining = Math.max(0, requiredLogs - totalLogs);

      return { percentage, logsRemaining };
    })
    .catch(() => {
      toast.error('Could not load engagement data');
      return { percentage: 0, logsRemaining: 9 };
    });
}
