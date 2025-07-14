import axiosInstance from '../api/axiosInstance';
import { getWeeklyEngagement } from '../utils/engagement';

/**
 * Check 7-day engagement → if user hit 65 %+ this week, grow plant by exactly +1 stage (max 6).
 * Returns an object your Dashboard can consume.
 *
 * @returns {Promise<{grown: boolean, level: number, logsRemaining: number}>}
 */
export function checkAndGrowPlant(userId) {
  return getWeeklyEngagement(userId)
    .then(async ({ percentage, logsRemaining }) => {
      // 1. What stage is the plant right now?
      const { data: { level: currentStage = 1 } = {} } =
        await axiosInstance.get('/api/plant-growth/me');

      console.table({
        'Engagement %': (percentage * 100).toFixed(1) + '%',
        'Current Stage': currentStage,
        'Logs Remaining': logsRemaining,
      });

      // 2. Should we grow? 65 %+ engagement AND not already at max
      const shouldGrow = percentage >= 0.65 && currentStage < 6;

      if (shouldGrow) {
        // POST automatically bumps stage by +1 in the backend
        const { data: { level } } = await axiosInstance.post('/api/plant-growth/grow');

        console.info('Plant grew →', { grown: true, level, logsRemaining });
        return { grown: true, level, logsRemaining };
      }

      // 3. No growth needed
      console.info('Plant check → no growth', {
        grown: false,
        level: currentStage,
        logsRemaining,
      });
      return { grown: false, level: currentStage, logsRemaining };
    })
    .catch(() => {
      // Fallback so the UI never crashes
      return { grown: false, level: 1, logsRemaining: 9 };
    });
}
