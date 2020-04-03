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
import moment from "moment";
import NotiBot from "./NotiBot";

const fs = require('fs');
const readline = require('readline');

export async function execute() {
  if (process.env.NODE_ENV == 'production') {
    // @nhancv 10/16/19: Start bot
    const notiBot = new NotiBot();
    await notiBot.onCreate();
    await notiBot.onStart();
    // @nhancv 10/16/19: Config cron
    const CronJob = require('cron').CronJob;
    const job = new CronJob({
      cronTime: '00 01 00 * * *',
      onTick: async () => {
        /*
         * Runs every day at 00:01:00 AM.
         */
        //~/.pm2/logs/ntradebot-out__2019-10-14_00-00-00.log
        const time = moment.utc().utcOffset("+0700").format("YYYY-MM-DD");
        const logPath = `${require('os').homedir()}/.pm2/logs/ntradebot-out__${time}_00-00-00.log`;
        processFile(time, logPath, notiBot);

      },
      start: false,
      timeZone: 'Asia/Ho_Chi_Minh'
    });
    job.start();
  }
}

function processFile(time, logPath, notiBot: NotiBot) {
  const inputFile = `${process.cwd()}/rd/candle_data/data/data.txt`;
  const outputName = `alpari_candles_${moment.utc().utcOffset("+0700").subtract(1, 'd').format("DD_MM_YYYY")}.txt`;
  const outputFile = `${process.cwd()}/rd/candle_data/data/${outputName}`;
  fs.copyFileSync(logPath, inputFile);
  const readInterface = readline.createInterface({input: fs.createReadStream(inputFile)});
  const duplicate = {};
  const writeStream = fs.createWriteStream(outputFile, {flags: 'w'});
  readInterface.on('line', (line) => {
    if (line.match(/(\[Wsprice\](\sALERT\s|\s)\d{1,} (GREEN|RED))/g)) {
      let msg = `[${line.substr(0, 16)}] ${line.substring(56).replace(/(ALERT |candles |🍎 |🍏 )/g, '')}`.trim();
      msg = msg.replace('RED', 'RED__');

      // @nhancv 9/23/19: Unify
      let volIndex = msg.indexOf("Vol: ");
      if (volIndex !== -1) {
        let buyIndex = msg.indexOf("[B:");
        let volString = msg.substring(volIndex, buyIndex);
        msg = msg.replace(volString, '');
        msg = msg.replace('[B:', '[BUY:');
        msg = msg.replace(', S:', ', SELL:');
      }

      if (!duplicate[msg]) {
        duplicate[msg] = true;
        writeStream.write(msg + '\n');
      }
    }
  }).on('close', () => {
    notiBot.sendDocument({
      source: fs.readFileSync(outputFile),
      filename: outputName
    });
  });
}
