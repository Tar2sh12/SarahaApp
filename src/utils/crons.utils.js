import { scheduleJob } from "node-schedule";
import { DateTime } from "luxon";
import { BlacklistToken } from "../../DB/models/index.js";
export const cronJobForRemovingEpiredTokens = () => {
  // Runs at 2:00 AM every 2 days starting from a specific date => "0 2 */2 * *"
  // Runs every 5 seconds => "*/5 * * * * *"
  const job = scheduleJob("*/5 * * * * *", async () => {
    const nowInSeconds = DateTime.now().toSeconds();
    const result = await BlacklistToken.deleteMany({
      expiresAt: { $lte: nowInSeconds },
    });
    console.log(`Removed ${result.deletedCount} expired tokens and current time in seconds ${nowInSeconds}`);
    
  });
};
