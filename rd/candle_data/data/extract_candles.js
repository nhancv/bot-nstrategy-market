/*
 * MIT License
 *
 * Copyright (c) 2018 Nhan Cao
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
 *
 */
const fs = require('fs');
const readline = require('readline');

const inputFile = 'data.txt';
const outputFile = 'data-out.txt';
const readInterface = readline.createInterface({
  input: fs.createReadStream(inputFile),
  console: false
});

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
});
