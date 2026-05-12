import axios from "axios";

const telegramBase = process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org";

function getApiUrl(): string {
  return `${telegramBase}/bot${process.env.BOT_TOKEN}`;
}

export function describeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? "no-response";
    const code = err.code ? ` code=${err.code}` : "";
    const msg = err.message ? ` msg="${err.message}"` : "";
    return `axios status=${status}${code}${msg}`;
  }
  return String(err);
}

async function withRetry<T>(label: string, fn: () => Promise<T>, retries = 2): Promise<T | undefined> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      console.error(`[TG] ${label} attempt ${attempt}/${retries} failed: ${describeError(err)}`);
      if (attempt < retries) await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

export async function sendMessage(chatId: number, text: string): Promise<void> {
  await withRetry("sendMessage", async () => {
    await axios.post(`${getApiUrl()}/sendMessage`, { chat_id: chatId, text });
    console.log(`[TG] sendMessage OK → chat=${chatId}`);
  });
}

export async function setMenuButton(chatId: number, miniAppUrl: string): Promise<void> {
  await withRetry("setMenuButton", async () => {
    await axios.post(`${getApiUrl()}/setChatMenuButton`, {
      chat_id: chatId,
      menu_button: {
        type: "web_app",
        text: "Открыть магазин",
        web_app: { url: miniAppUrl },
      },
    });
    console.log(`[TG] setMenuButton OK → chat=${chatId}`);
  });
}

export async function deleteWebhook(): Promise<void> {
  try {
    await axios.post(`${getApiUrl()}/deleteWebhook`, {});
    console.log("[TG] Webhook deleted");
  } catch (err) {
    console.error("[TG] Failed to delete webhook:", describeError(err));
  }
}

export async function getUpdates(offset: number): Promise<import("./types").TelegramUpdate[]> {
  const res = await axios.get(`${getApiUrl()}/getUpdates`, {
    params: { offset, timeout: 25, allowed_updates: ["message"] },
    timeout: 30_000,
  });
  return res.data?.result ?? [];
}
