/*
 * MIT License
 *
 * Copyright (c) 2019 Nhan Cao
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Telegraf from 'telegraf'

/**
 * This bot for notify
 */
export default class NotiBot {

  bot: any;
  botToken: any = process.env.BOT_TOKEN;
  botChannelId: any = process.env.BOT_CHANNEL_ID;
  botAdminId: any = process.env.BOT_ADMIN_ID;

  async onCreate() {
    this.bot = new Telegraf(this.botToken);
    this.bot.telegram.getMe().then((botInfo) => {
      this.bot.options.username = botInfo.username
    });
    //middleware
    this.bot.use((ctx, next) => {
      if (ctx.updateType == 'callback_query' ||
        (ctx.updateType == 'message' && (this.isAdmin(String(ctx.message.from.id))))) {
        return next(ctx);
      }
    });
    this.bot.start((ctx) => ctx.reply('Welcome'));

    // Admin only: Get chat id
    this.bot.command('chatId', async (ctx) => {
      if (!this.isAdmin(String(ctx.message.from.id))) return;
      let chatId = ctx.message.chat.id;
      // await ctx.reply(`${chatId}`);
      this.sendMessageToAdmin(chatId);
    });

    // @nhancv 2019-08-31: reset command
    this.bot.on('text', async (ctx) => {
    });
  }

  async onStart() {
    if (this.bot) {
      await this.bot.launch();
    }
  }

  async onStop() {
    if (this.bot) {
      this.bot.stop();
    }
  }

  async onDestroy() {
    this.bot = null;
  }

  sendMessageToAdmin = (message: string) => {
    this.bot.telegram.sendMessage(this.botAdminId, message).catch(error => {
      console.error(error);
    })
  };

  sendMessage = (message: string) => {
    this.bot.telegram.sendMessage(this.botChannelId, message).catch(error => {
      console.error(error);
    })
  };

  sendDocument = (document: any) => {
    this.bot.telegram.sendDocument(this.botChannelId, document).catch(function (error) {
      console.error(error);
    });
  };

  isAdmin = (id: string): boolean => {
    // @nhancv 9/14/19: Need to parse fromId to String in indexOf case
    return id == this.botAdminId;
  };

}
