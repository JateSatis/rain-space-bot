import axios from "axios";

const apiBase = process.env.RAIN_SPACE_API_URL;

export async function upsertBotUser(user: {
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium?: boolean;
  isBot?: boolean;
}): Promise<void> {
  if (!apiBase) return;
  try {
    await axios.post(`${apiBase}/api/bot-users`, user);
  } catch (err) {
    console.error("[DB] upsertBotUser failed:", String(err));
  }
}

export async function deleteBotUser(chatId: string): Promise<void> {
  if (!apiBase) return;
  try {
    await axios.delete(`${apiBase}/api/bot-users/${chatId}`);
    console.log(`[DB] deleteBotUser OK → chatId=${chatId}`);
  } catch (err) {
    console.error("[DB] deleteBotUser failed:", String(err));
  }
}
