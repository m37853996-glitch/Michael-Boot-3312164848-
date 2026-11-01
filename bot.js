const { Telegraf, Markup } = require("telegraf");
const express = require('express');

// إعداد خادم الويب السريع للبقاء قيد التشغيل 24/7
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.status(200).send('Bot is active and running 24/7!'));
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

// توكن البوت
const bot = new Telegraf("8854896488:AAEXXUTuwpD04u-VIOmBMQr-eo_SdTytJHw");

// بيانات بسيطة ومرتبة
let botData = {
  admins: ["8988529781"],
  activeGroups: ["-1004308451962"],
  groupExpiry: { "-1004308451962": Date.now() + (30 * 24 * 60 * 60 * 1000) }, // 30 يوم تجريبي للمجموعة الافتراضية
  groupNames: { "-1004308451962": "مجموعة مايكل الرسمية" },
  userExpiry: { "8988529781": Date.now() + (365 * 24 * 60 * 60 * 1000) } // المطور
};

const DEVELOPER_ID = "8988529781";
const isAdmin = (id) => botData.admins.includes(id.toString()) || id.toString() === DEVELOPER_ID;

// 1. أمر البداية /start
bot.start((ctx) => {
  const chatType = ctx.chat.type;

  // لو البوت في مجموعة
  if (chatType === 'group' || chatType === 'supergroup') {
    return ctx.reply("🤖 ⚡ 𝙈𝙄𝘾𝙃𝘼𝙀𝙇 BOT\n\n/on\n/off\n/myinfo");
  }

  // لو البوت في الخاص
  return ctx.replyWithMarkdown(
    `╭━━━━━━━━━━━━━━━━━━╮\n` +
    `⚡ 𝙈𝙄𝘾𝙃𝘼𝙀𝙇 𝙀𝙇𝙄𝙏𝙀\n` +
    `╰━━━━━━━━━━━━━━━━━━╯\n\n` +
    `👋 أهلاً بك في بوت الخدمات الذكي.\n` +
    `📌 استخدم الأمر /myinfo لعرض تفاصيل اشتراكك.`
  );
});

// 2. أمر التشغيل /on (خاص بالمجموعات)
bot.command("on", (ctx) => {
  if (ctx.chat.type === 'private') return ctx.reply("⚠️ هذا الأمر للمجموعات فقط.");
  return ctx.reply("🟢 تم تشغيل البوت في المجموعة بنجاح!");
});

// 3. أمر الإيقاف /off (خاص بالمجموعات)
bot.command("off", (ctx) => {
  if (ctx.chat.type === 'private') return ctx.reply("⚠️ هذا الأمر للمجموعات فقط.");
  return ctx.reply("🔴 تم إيقاف البوت في المجموعة.");
});

// 4. أمر /myinfo المنفصل بدقة (خاص + مجموعات)
bot.command("myinfo", (ctx) => {
  const chatId = ctx.chat.id.toString();
  const userId = ctx.from.id.toString();
  const chatType = ctx.chat.type;

  // --- إذا كان الأمر داخل مجموعة ---
  if (chatType === 'group' || chatType === 'supergroup') {
    const groupName = botData.groupNames[chatId] || ctx.chat.title || "هذه المجموعة";
    const expiry = botData.groupExpiry[chatId];
    
    let timeText = "دائم";
    if (expiry) {
      const timeLeft = expiry - Date.now();
      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        timeText = `${days} يوم و ${hours} ساعة`;
      } else {
        timeText = "منتهي ❌";
      }
    }

    return ctx.replyWithMarkdown(
      `╭━━━ ⚡ 𝙈𝙄𝘾𝙃𝘼𝙀𝙇 𝙀𝙇𝙄𝙏𝙀 ━━━╮\n\n` +
      `📌 اسم المجموعة: *${groupName}*\n` +
      `🆔 الآيدي: \`${chatId}\`\n` +
      `⏳ المتبقي لاشتراك المجموعة: \`${timeText}\`\n\n` +
      `╰━━━━━━━━━━━━━━━━━━╯`
    );
  }

  // --- إذا كان الأمر في المحادثة الخاصة (Private) ---
  const userExp = botData.userExpiry[userId];
  let hasPersonal = isAdmin(userId) || (userExp && userExp > Date.now());
  let personalTime = "مفعل دائماً ⚡";

  if (!isAdmin(userId) && userExp) {
    const left = userExp - Date.now();
    if (left > 0) {
      const days = Math.floor(left / (1000 * 60 * 60 * 24));
      const hours = Math.floor((left % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      personalTime = `${days} يوم و ${hours} ساعة`;
    } else {
      hasPersonal = false;
    }
  }

  if (!hasPersonal) {
    return ctx.replyWithMarkdown("⚠️ عذراً، ليس لديك أي اشتراك شخصي مفعل حالياً.");
  }

  return ctx.replyWithMarkdown(
    `╭━━━━━━━━━━━━━━━━━━╮\n` +
    `⚡ تقرير اشتراكك الشخصي\n` +
    `╰━━━━━━━━━━━━━━━━━━╯\n\n` +
    `👤 الآيدي: \`${userId}\`\n` +
    `⏳ المدة المتبقية: \`${personalTime}\`\n\n` +
    `⚡ 𝙈𝙄𝘾𝙃𝘼𝙀𝙇 𝙀𝙇𝙄𝙏𝙀`
  );
});

// تشغيل البوت
bot.launch().then(() => console.log("Clean Bot started successfully!"));
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
