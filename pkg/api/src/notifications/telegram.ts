import axios from "axios";

import logger from "@/loaders/logger";
import { conf } from "@/app/config";

export default class Telegram {
  botToken: any;
  chatId: any;
  sendSilently: any;
  constructor() {
    this.botToken = conf.get("notifications.telegram.token") || null;
    this.chatId = conf.get("notifications.telegram.id") || null;
    this.sendSilently = conf.get("notifications.telegram.silent") || false;
  }

  check() {
    if (!this.botToken || !this.chatId) return false;
    return true;
  }

  buildText(content = null, data: any = null) {
    let text = `${content}`;

    if (data) {
      text = `<b>${data.title}</b>\n${data.content}\nRequested by *${data.username}*`;
    }
    return text;
  }

  async test() {
    if (!this.check()) {
      logger.verbose("Telegram: Chat id or bot token missing", {
        label: "notifications.telegram",
      });
      return {
        result: false,
        error: "Chat id or bot token missing",
      };
    }
    logger.verbose("Telegram: Sending test message", {
      label: "notifications.telegram",
    });
    const defaultText: any = "Petio Test";
    let text = this.buildText(defaultText);
    let test = await this.postMessage(text);
    if (!test) {
      logger.verbose("Telegram: Test Failed", {
        label: "notifications.telegram",
      });
      return {
        result: false,
        error: "Failed to send message",
      };
    }
    logger.verbose("Telegram: Test passed", {
      label: "notifications.telegram",
    });
    return {
      result: true,
      error: false,
    };
  }

  send(title = null, content = null, username = null, image = null) {
    if (!this.check()) {
      logger.verbose("Telegram: No config defined", {
        label: "notifications.telegram",
      });
      return {
        result: false,
        error: "No config found",
      };
    }
    logger.verbose(`Telegram: Sending message - ${content}`, {
      label: "notifications.telegram",
    });
    const text = this.buildText(null, {
      title: title,
      content: content,
      username: username,
      image: image,
    });
    this.postMessage(text);
  }

  async postMessage(text) {
    try {
      const params = new URLSearchParams();
      params.append("chat_id", this.chatId);
      params.append("text", text);
      params.append("parse_mode", "HTML");
      if (this.sendSilently) {
        params.append("disable_notification", "true");
      }

      await axios.get(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          params,
        }
      );
      logger.verbose("Telegram: message sent", {
        label: "notifications.telegram",
      });
      return true;
    } catch (err) {
      logger.verbose("Telegram: Failed to send message", {
        label: "notifications.telegram",
      });
      return false;
    }
  }
}
