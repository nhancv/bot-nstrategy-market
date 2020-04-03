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

// Init dotenv
import NotiBot from "./NotiBot";

const result = require('dotenv').config({path: '.env'});
if (result.error) console.error(result.error.message);

// @nhancv 2019-09-06: Catch all unhandled Promise rejections
process.on('unhandledRejection', function (err) {
  console.error(err);
});

// @nhancv 10/15/19: Start application
import * as App from './App'
// @nhancv 10/15/19: Cron job
import * as CronJob from './CronJob'

(async () => {
  try {
    // @nhancv 9/16/19: Run app
    await App.execute();
    // @nhancv 10/15/19: Run cron job
    await CronJob.execute();
  } catch (e) {
    console.error(e.message);
  }
})();

