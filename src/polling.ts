import { TelegramUpdate } from "./types";
import { deleteWebhook, describeError, getUpdates, sendMessage, setMenuButton } from "./telegram";

const processedIds = new Set<number>();
const PROCESSED_IDS_LIMIT = 500;

async function handleUpdate(update: TelegramUpdate): Promise<void> {
  const updateId = update.update_id;

  if (processedIds.has(updateId)) return;
  processedIds.add(updateId);
  if (processedIds.size > PROCESSED_IDS_LIMIT) {
    const oldest = processedIds.values().next().value!;
    processedIds.delete(oldest);
  }

  if (!update.message) return;

  const miniAppUrl = process.env.MINI_APP_URL;
  const chatId = update.message.chat.id;
  const username = update.message.from?.username ?? update.message.from?.first_name ?? "unknown";
  const text = update.message.text ?? "";

  console.log(`[BOT] update_id=${updateId} chat=${chatId} user=@${username} text="${text}"`);

  if (!miniAppUrl) {
    console.warn("[BOT] MINI_APP_URL is not set — skipping setMenuButton");
    return;
  }

  await setMenuButton(chatId, miniAppUrl);
  if (text.startsWith("/start")) {
    await sendMessage(chatId, "Нажмите кнопку «Открыть магазин»");
  }
}

export async function startPolling(): Promise<void> {
  await deleteWebhook();

  let offset = 0;
  console.log("[BOT] Polling started");

  while (true) {
    try {
      const updates = await getUpdates(offset);
      for (const update of updates) {
        if (update.update_id >= offset) offset = update.update_id + 1;
        handleUpdate(update).catch((err) => console.error("[BOT] handleUpdate error:", String(err)));
      }
    } catch (err) {
      console.error("[BOT] Polling error:", describeError(err));
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}
