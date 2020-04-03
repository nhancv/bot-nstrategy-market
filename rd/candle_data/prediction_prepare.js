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

/**
 * Read input file, extract to data for prediction
 */
const fs = require('fs');

const writeStream = fs.createWriteStream('prediction-data.txt', {flags: 'w'});
const inputFileList = [
  // 'alpari_candles_test.txt',
  'alpari_candles_18_09_2019.txt',
  // 'alpari_candles_19_09_2019.txt',
  // 'alpari_candles_20_09_2019.txt',
  // 'alpari_candles_21_09_2019.txt',
  // 'alpari_candles_22_09_2019.txt',
  // 'alpari_candles_23_09_2019.txt',
  // 'alpari_candles_24_09_2019.txt',
  // 'alpari_candles_25_09_2019.txt',
  // 'alpari_candles_26_09_2019.txt',
];

inputFileList.forEach(i => {
  const contents = fs.readFileSync(i, 'utf8').split("\n").filter(line => line.trim().length > 0);
  contents.forEach(line => {
    const lineDataArr = line.split(" ");
    const color = lineDataArr[2] === 'GREEN' ? 0 : 1;
    writeStream.write(`${color} `);
  });
});

console.log('Done');
