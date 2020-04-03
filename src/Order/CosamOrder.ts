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

import BaseOrder from "./BaseOrder";
import moment from "moment";
import IStrategyResult from "../Model/IStrategyResult";

const timeZone = "+0700";

const TYPE_1 = 1;
const TYPE_2 = 2;
const TYPE_3 = 3;
const TYPE_4 = 4;
const TYPE_5 = 5;
const TYPE_6 = 6;
const TYPE_6_1 = 61;
const TYPE_7 = 7;
const TYPE_7_1 = 71;
const TYPE_8 = 8;
const TYPE_8_1 = 81;
const TYPE_8_2 = 82;
const TYPE_8_3 = 83;
const TYPE_8_4 = 84;
const TYPE_8_5 = 85;
const TYPE_8_6 = 86;


/**
 cosam_order
 Co Sam (owner) - Giải pháp kết hợp nhiều cách đánh được nghiên cứu kỹ lưỡng.
 Rất phức tạp nên không ghi hết ví dụ. Chi tiết hỏi owner nhé.

 * This strategy combine some approach from Co Sam
 * 1. Default
 xxxxxxxxx => d
 xxxxxxxxxx => d
 xxxxxxxxxxx => d

 * 2. Alternate
 xdxdxdxdxd => d
 xdxdxdxdxdx => x
 xdxdxdxdxdxd => d
 xdxdxdxdxdxdx => x
 xdxdxdxdxdxdxd => d

 * 3. Approach 2-2
 xx dd xx dd xx danh x
 xx dd xx dd xx d danh x
 xx dd xx dd xx dd danh d

 * 4. Approach 3-3
 xxx ddd xxx d danh x
 xxx ddd xxx dd danh x
 xxx ddd xxx ddd danh d
 xxx ddd xxx ddd x danh d
 xxx ddd xxx ddd xx danh d

 // * 5. Approach 4-4
 // xxxx dddd xx danh d
 // xxxx dddd xxx danh x
 // xxxx dddd xxx d danh x
 // xxxx dddd xxx dd danh x
 // xxxx dddd xxx ddd danh d
 // xxxx dddd xxx ddd x danh d

 * 6. Approach loop 3-3-2 (2-1)
 xxd xxd xxd danh d
 xxd xxd xxd x danh d
 xxd xxd xxd xx danh x
 xxd xxd xxd xxd danh d
 xxd xxd xxd xxd x danh d
 xxd xxd xxd xxd xx danh x

 // * 6.1. Approach loop 3-3-2 (1-2)
 // xdd xdd xdd danh d
 // xdd xdd xdd x danh x
 // xdd xdd xdd xd danh x
 // xdd xdd xdd xdd danh d
 // xdd xdd xdd xdd x danh x
 // xdd xdd xdd xdd xd danh x
 // xdd xdd xdd xdd xdd danh d

 * 7. Approach loop 4-4-2 (3-1)
 xxxd xxxd xxxd danh d
 xxxd xxxd xxxd x danh d
 xxxd xxxd xxxd xx danh d
 xxxd xxxd xxxd xxx danh x
 xxxd xxxd xxxd xxxd danh d
 xxxd xxxd xxxd xxxd x danh d

 * 7.1. Approach loop 4-4-2 (1-3)
 xddd xddd xd danh x
 xddd xddd xdd danh x
 xddd xddd xddd danh d
 xddd xddd xddd x danh x
 xddd xddd xddd xd danh x
 xddd xddd xddd xdd danh x
 xddd xddd xddd xddd danh d

 * 8. Approach loop 5-5 (3-2)
 xxxdd xxxdd x danh d
 xxxdd xxxdd xx danh d
 xxxdd xxxdd xxx danh x
 xxxdd xxxdd xxxd danh x
 xxxdd xxxdd xxxdd danh d

 * 8.1. Approach loop 5-5 (2-3)
 xxddd xxddd x danh d
 xxddd xxddd xx danh x
 xxddd xxddd xxd danh x
 xxddd xxddd xxdd danh x
 xxddd xxddd xxddd danh d

 * 8.2. Approach loop 5-5 (4-1)
 xxxxd xxxxd x danh d
 xxxxd xxxxd xx danh d
 xxxxd xxxxd xxx danh d
 xxxxd xxxxd xxxx danh x
 xxxxd xxxxd xxxxd danh d
 xxxxd xxxxd xxxxd x danh d
 xxxxd xxxxd xxxxd xx danh d
 xxxxd xxxxd xxxxd xxx danh d
 xxxxd xxxxd xxxxd xxxx danh x

 * 8.3. Approach loop 5-5 (1-4)
 xdddd xdddd x danh x
 xdddd xdddd xd danh x
 xdddd xdddd xdd danh x
 xdddd xdddd xddd danh x
 xdddd xdddd xdddd danh d
 xdddd xdddd xdddd x danh x

 * 8.4. Approach loop 5-5 (1-1-3)
 xdxxx  xdxxx x danh x
 xdxxx  xdxxx xd danh d
 xdxxx  xdxxx xdx danh d
 xdxxx  xdxxx xdxx danh d
 xdxxx  xdxxx xdxxx danh d
 xdxxx  xdxxx xdxxx x danh x
 xdxxx  xdxxx xdxxx xd danh d

 * 8.5. Approach loop 5-5 (1-2-2)
 xddxx  xddxx x danh x
 xddxx  xddxx xd danh x
 xddxx  xddxx xdd danh d
 xddxx  xddxx xddx danh d
 xddxx  xddxx xddxx danh d
 xddxx  xddxx xddxx x danh x
 xddxx  xddxx xddxx xd danh x

 * 8.6. Approach loop 5-5 (1-3-1)
 xdddx  xdddx xd danh x
 xdddx  xdddx xdd danh x
 xdddx  xdddx xddd danh d
 xdddx  xdddx xdddx danh d
 xdddx  xdddx xdddx x danh x
 xdddx  xdddx xdddx xd danh x
 xdddx  xdddx xdddx xdd danh x
 xdddx  xdddx xdddx xddd danh d

 */
export default class CosamOrder implements BaseOrder {
  static order_id = 'cosam_order';
  // @nhancv 10/14/19: IMPORTANT - Order strategy must be singleton to keep config live
  static instance: CosamOrder = new CosamOrder();

  // @nhancv 10/17/19: Active order at trigger
  defaultOrderTrigger = 9;

  // @nhancv 10/18/19: Save strategy type
  // 0: nothing, 1: default, more detail see description at top of file
  lastStrategyMap = {};
  // @nhancv 9/18/19: Save current index of amount array with key is accountId
  currentIndexMap: {};
  // @nhancv 9/18/19: Save last order color => true: buy/green, false: sell/red
  lastIsGreenMap: {};
  // @nhancv 10/18/19: Save last order time to solve bot stop interrupt
  lastOrderTimeMap: {};

  // @nhancv 10/15/19: data-store for local caching store in root_project/cache
  store = require('data-store')({path: process.cwd() + `/cache/${CosamOrder.order_id}.json`});

  constructor() {
    this.currentIndexMap = {};
    this.lastStrategyMap = {};
    this.lastIsGreenMap = {};
    this.lastOrderTimeMap = {};
  }

  // @nhancv 10/14/19: Clean properties
  clean(accountId: string) {
    if (accountId == "all") {
      this.clearAll();
    } else {
      // @nhancv 10/14/19: Reset default value
      this.currentIndexMap[accountId] = -1;
      this.lastStrategyMap[accountId] = 0;
      this.lastIsGreenMap[accountId] = false;
      this.lastOrderTimeMap[accountId] = 0;

      // @nhancv 10/14/19: Delete property
      delete this.currentIndexMap[accountId];
      delete this.lastStrategyMap[accountId];
      delete this.lastIsGreenMap[accountId];
      delete this.lastOrderTimeMap[accountId];

      this.store.del(accountId);
    }
  }

  // @nhancv 10/15/19: Clear all cache
  clearAll() {
    this.currentIndexMap = {};
    this.lastStrategyMap = {};
    this.lastIsGreenMap = {};
    this.lastOrderTimeMap = {};
    this.store.clear();
  }

  // @nhancv 10/14/19: Apply strategy
  apply(isGreen: boolean, candles: number, colorList: number[], accountId: string, accountAmounts: number[]): { buy: boolean, amount: number } {
    let now = moment.utc().utcOffset(timeZone).startOf('minute');
    let colorSequence: string = colorList.toString().replace(/,/g, "");
    let res: IStrategyResult = {buy: false, amount: 0, data: null};
    ////// RESTORE FROM CACHE //////
    // @nhancv 10/15/19: Restore from local caching
    let configCaching = this.store.get(accountId);
    if (configCaching) {
      this.currentIndexMap[accountId] = configCaching.currentIndexMap;
      this.lastStrategyMap[accountId] = configCaching.lastStrategyMap;
      this.lastIsGreenMap[accountId] = configCaching.lastIsGreenMap;
      this.lastOrderTimeMap[accountId] = configCaching.lastOrderTimeMap;
    }

    ////// INIT CONFIG DATA //////
    // @nhancv 9/18/19: Init index
    if (!this.currentIndexMap.hasOwnProperty(accountId)) {
      this.currentIndexMap[accountId] = -1;
    }
    // @nhancv 9/18/19: Init in order map
    if (!this.lastStrategyMap.hasOwnProperty(accountId)) {
      this.lastStrategyMap[accountId] = 0;
    }
    // @nhancv 9/18/19: Init extra data
    if (!this.lastIsGreenMap.hasOwnProperty(accountId)) {
      this.lastIsGreenMap[accountId] = false;
    }
    // @nhancv 9/18/19: Init last order time
    if (!this.lastOrderTimeMap.hasOwnProperty(accountId)) {
      this.lastOrderTimeMap[accountId] = 0;
    }

    ////// LOGIC //////

    this.logicChecking(accountId, candles, res, isGreen, colorSequence);

    ////// RESET IF BOT INTERRUPT //////
    const lastTimeOrder = moment(this.lastOrderTimeMap[accountId]).utcOffset(timeZone);
    if (this.lastOrderTimeMap[accountId] != 0 &&
      lastTimeOrder.isValid() && now.clone().subtract(1, 'm').isAfter(lastTimeOrder)
    ) {
      this.currentIndexMap[accountId] = -1;
    }

    ////// FINAL AMOUNT //////
    // @nhancv 9/18/19: Get amount from index
    if (this.currentIndexMap[accountId] >= 0 && this.currentIndexMap[accountId] < accountAmounts.length) {
      let amount = accountAmounts[this.currentIndexMap[accountId]];
      // @nhancv 10/19/19: Update data property to response
      switch (this.lastStrategyMap[accountId]) {
        case TYPE_1:
          res.data = `[${CosamOrder.order_id}] Type 1: Default`;
          break;
        case TYPE_2:
          res.data = `[${CosamOrder.order_id}] Type 2: Alternate`;
          break;
        case TYPE_3:
          res.data = `[${CosamOrder.order_id}] Type 3: Approach 2-2`;
          break;
        case TYPE_4:
          res.data = `[${CosamOrder.order_id}] Type 4: Approach 3-3`;
          break;
        case TYPE_5:
          res.data = `[${CosamOrder.order_id}] Type 5: Approach 4-4`;
          break;
        case TYPE_6:
          res.data = `[${CosamOrder.order_id}] Type 6: Approach loop 3-3-2 (2-1)`;
          break;
        case TYPE_6_1:
          res.data = `[${CosamOrder.order_id}] Type 6.1: Approach loop 3-3-2 (1-2)`;
          break;
        case TYPE_7:
          res.data = `[${CosamOrder.order_id}] Type 7: Approach loop 4-4-2 (3-1)`;
          break;
        case TYPE_7_1:
          res.data = `[${CosamOrder.order_id}] Type 7.1: Approach loop 4-4-2 (1-3)`;
          break;
        case TYPE_8:
          res.data = `[${CosamOrder.order_id}] Type 8: Approach loop 5-5 (3-2)`;
          break;
        case TYPE_8_1:
          res.data = `[${CosamOrder.order_id}] Type 8.1: Approach loop 5-5 (2-3)`;
          break;
        case TYPE_8_2:
          res.data = `[${CosamOrder.order_id}] Type 8.2: Approach loop 5-5 (4-1)`;
          break;
        case TYPE_8_3:
          res.data = `[${CosamOrder.order_id}] Type 8.3: Approach loop 5-5 (1-4)`;
          break;
        case TYPE_8_4:
          res.data = `[${CosamOrder.order_id}] Type 8.4: Approach loop 5-5 (1-1-3)`;
          break;
        case TYPE_8_5:
          res.data = `[${CosamOrder.order_id}] Type 8.5: Approach loop 5-5 (1-2-2)`;
          break;
        case TYPE_8_6:
          res.data = `[${CosamOrder.order_id}] Type 8.6: Approach loop 5-5 (1-3-1)`;
          break;

      }

      res.amount = Math.abs(amount);

      this.lastIsGreenMap[accountId] = res.buy;
      this.lastOrderTimeMap[accountId] = now;
    } else {
      res.data = null;
      res.amount = 0;
      this.currentIndexMap[accountId] = -1;
      this.lastStrategyMap[accountId] = 0;
      this.lastIsGreenMap[accountId] = false;
      this.lastOrderTimeMap[accountId] = 0;
    }
    ////// SAVE TO CACHE //////
    // @nhancv 10/15/19: Save config to local
    this.store.set(accountId, {
      currentIndexMap: this.currentIndexMap[accountId],
      lastStrategyMap: this.lastStrategyMap[accountId],
      lastIsGreenMap: this.lastIsGreenMap[accountId],
      lastOrderTimeMap: this.lastOrderTimeMap[accountId],
    });

    return res;
  }

  private logicChecking(accountId: string, candles: number, res: IStrategyResult, isGreen: boolean, colorSequence: string) {
    // @nhancv 10/18/19: Check order type = 1
    // xxxxxxxxx => d
    // xxxxxxxxxx => d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_1) {
      if (this.lastStrategyMap[accountId] == 0 &&
        candles >= this.defaultOrderTrigger) {
        res.buy = !isGreen;
        this.currentIndexMap[accountId] = candles - this.defaultOrderTrigger;
        this.lastStrategyMap[accountId] = TYPE_1;
      } else if (this.lastStrategyMap[accountId] == TYPE_1) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          res.buy = !isGreen;
          this.currentIndexMap[accountId]++;
        }
      }
    }

    // @nhancv 10/18/19: Check order type = 2
    // xdxdxdxdxd => d
    // xdxdxdxdxdx => x
    // xdxdxdxdxdxd => d
    // xdxdxdxdxdxdx => x
    // xdxdxdxdxdxdxd => d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_2) {
      const pattern1 = "0101010101";
      const pattern2 = "1010101010";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        res.buy = isGreen;
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_2;
      } else if (this.lastStrategyMap[accountId] == TYPE_2) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          res.buy = isGreen;
          this.currentIndexMap[accountId]++;
        }
      }
    }

    // @nhancv 10/18/19: Check order type = 3
    // xx dd xx dd xx danh x
    // xx dd xx dd xx d danh x
    // xx dd xx dd xx dd danh d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_3) {
      const pattern1 = "0011001100";
      const pattern2 = "1100110011";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_3;

        res.buy = isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_3) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt !== 0 && (indexInt % 2 === 0)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    // @nhancv 10/18/19: Check order type = 4
    // xxx ddd xxx d danh x
    // xxx ddd xxx dd danh x
    // xxx ddd xxx ddd danh d
    // xxx ddd xxx ddd x danh d
    // xxx ddd xxx ddd xx danh d
    // xxx ddd xxx ddd xxx danh x
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_4) {
      const pattern1 = "0001110001";
      const pattern2 = "1110001110";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_4;

        res.buy = !isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_4) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt !== 0 && (indexInt % 3 === 2)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    // // @nhancv 10/18/19: Check order type = 5
    // // * 5. Approach 4-4
    // //   xxxx dddd xx danh d
    // //   xxxx dddd xxx danh x
    // //   xxxx dddd xxx d danh x
    // //   xxxx dddd xxx dd danh x
    // //   xxxx dddd xxx ddd danh d
    // //   xxxx dddd xxx ddd x danh d
    //
    // if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_5) {
    //   const pattern1 = "0000111100";
    //   const pattern2 = "1111000011";
    //   const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
    //   if (this.lastStrategyMap[accountId] == 0 &&
    //     (suffix == pattern1 || suffix == pattern2)) {
    //     this.currentIndexMap[accountId] = 0;
    //     this.lastStrategyMap[accountId] = TYPE_5;
    //
    //     res.buy = !isGreen;
    //
    //   } else if (this.lastStrategyMap[accountId] == TYPE_5) {
    //     // @nhancv 10/18/19: Check win to reset
    //     if (this.lastIsGreenMap[accountId] == isGreen) {
    //       this.currentIndexMap[accountId] = -1;
    //       this.lastStrategyMap[accountId] = 0;
    //       this.logicChecking(accountId, candles, res, isGreen, colorSequence);
    //     } else {
    //       this.currentIndexMap[accountId]++;
    //
    //       res.buy = (parseInt(`${this.currentIndexMap[accountId]}`) % 3 === 1) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];
    //
    //     }
    //   }
    // }

    // @nhancv 10/18/19: Check order type = 6
    // * 6. Approach loop 3-3-2 (2-1)
    //  xxd xxd xxd danh d
    //  xxd xxd xxd x danh d
    //  xxd xxd xxd xx danh x
    //  xxd xxd xxd xxd danh d
    //  xxd xxd xxd xxd x danh d
    //  xxd xxd xxd xxd xx danh x
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_6) {
      const pattern1 = "001001001";
      const pattern2 = "110110110";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_6;

        res.buy = isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_6) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt !== 0 && (indexInt % 3 === 0 || indexInt % 3 === 2)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    // // @nhancv 10/18/19: Check order type = 6.1
    // // * 6.1. Approach loop 3-3-2 (1-2)
    // //   xdd xdd xdd danh d
    // //   xdd xdd xdd x danh x
    // //   xdd xdd xdd xd danh x
    // //   xdd xdd xdd xdd danh d
    // //   xdd xdd xdd xdd x danh x
    // //   xdd xdd xdd xdd xd danh x
    // //   xdd xdd xdd xdd xdd danh d
    // if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_6_1) {
    //   const pattern1 = "011011011";
    //   const pattern2 = "100100100";
    //   const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
    //   if (this.lastStrategyMap[accountId] == 0 &&
    //     (suffix == pattern1 || suffix == pattern2)) {
    //     this.currentIndexMap[accountId] = 0;
    //     this.lastStrategyMap[accountId] = TYPE_6_1;
    //
    //     res.buy = isGreen;
    //
    //   } else if (this.lastStrategyMap[accountId] == TYPE_6_1) {
    //     // @nhancv 10/18/19: Check win to reset
    //     if (this.lastIsGreenMap[accountId] == isGreen) {
    //       this.currentIndexMap[accountId] = -1;
    //       this.lastStrategyMap[accountId] = 0;
    //       this.logicChecking(accountId, candles, res, isGreen, colorSequence);
    //     } else {
    //       this.currentIndexMap[accountId]++;
    //
    //       const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
    //       res.buy = (indexInt !== 0 && (indexInt % 3 === 0 || indexInt % 3 === 1)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];
    //
    //     }
    //   }
    // }

    // @nhancv 10/18/19: Check order type = 7 (3-1)
    // xxxd xxxd xxxd danh d
    // xxxd xxxd xxxd x danh d
    // xxxd xxxd xxxd xx danh d
    // xxxd xxxd xxxd xxx danh x
    // xxxd xxxd xxxd xxxd danh d
    // xxxd xxxd xxxd xxxd x danh d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_7) {
      const pattern1 = "000100010001";
      const pattern2 = "111011101110";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_7;

        res.buy = isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_7) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt % 4 === 0 || indexInt % 4 === 3) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    // @nhancv 10/18/19: Check order type = 7.1
    // * 7.1. Approach loop 4-4-2 (1-3)
    //   xddd xddd xd danh x
    //   xddd xddd xdd danh x
    //   xddd xddd xddd danh d
    //   xddd xddd xddd x danh x
    //   xddd xddd xddd xd danh x
    //   xddd xddd xddd xdd danh x
    //   xddd xddd xddd xddd danh d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_7_1) {
      const pattern1 = "0111011101";
      const pattern2 = "1000100010";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_7_1;

        res.buy = !isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_7_1) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt % 4 === 3 || indexInt % 4 === 2) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    // @nhancv 10/18/19: Check order type = 8
    // * 8. Approach loop 5-5 (3-2)
    //   xxxdd xxxdd x danh d
    //   xxxdd xxxdd xx danh d
    //   xxxdd xxxdd xxx danh x
    //   xxxdd xxxdd xxxd danh x
    //   xxxdd xxxdd xxxdd danh d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_8) {
      const pattern1 = "00011000110";
      const pattern2 = "11100111001";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_8;

        res.buy = !isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_8) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt != 0 && (indexInt % 5 === 2 || indexInt % 5 === 4)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    // @nhancv 11/06/19: Check order type = 8.1
    // * 8.1. Approach loop 5-5 (2-3)
    //   xxddd xxddd x danh d
    //   xxddd xxddd xx danh x
    //   xxddd xxddd xxd danh x
    //   xxddd xxddd xxdd danh x
    //   xxddd xxddd xxddd danh d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_8_1) {
      const pattern1 = "00111001110";
      const pattern2 = "11000110001";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_8_1;

        res.buy = !isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_8_1) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt != 0 && (indexInt % 5 === 1 || indexInt % 5 === 4)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    // @nhancv 11/08/19: Check order type = 8.2
    // * 8.2. Approach loop 5-5 (4-1)
    //   xxxxd xxxxd x danh d
    //   xxxxd xxxxd xx danh d
    //   xxxxd xxxxd xxx danh d
    //   xxxxd xxxxd xxxx danh x
    //   xxxxd xxxxd xxxxd danh d
    //   xxxxd xxxxd xxxxd x danh d
    //   xxxxd xxxxd xxxxd xx danh d
    //   xxxxd xxxxd xxxxd xxx danh d
    //   xxxxd xxxxd xxxxd xxxx danh x
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_8_2) {
      const pattern1 = "00001000010";
      const pattern2 = "11110111101";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_8_2;

        res.buy = !isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_8_2) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt != 0 && (indexInt % 5 === 4 || indexInt % 5 === 3)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    //   * 8.3. Approach loop 5-5 (1-4)
    //   xdddd xdddd x danh x
    //   xdddd xdddd xd danh x
    //   xdddd xdddd xdd danh x
    //   xdddd xdddd xddd danh x
    //   xdddd xdddd xdddd danh d
    //   xdddd xdddd xdddd x danh x
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_8_3) {
      const pattern1 = "01111011110";
      const pattern2 = "10000100001";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_8_3;

        res.buy = isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_8_3) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt != 0 && (indexInt % 5 === 4 || indexInt % 5 === 0)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    //   * 8.4. Approach loop 5-5 (1-1-3)
    //   xdxxx  xdxxx x danh x
    //   xdxxx  xdxxx xd danh d
    //   xdxxx  xdxxx xdx danh d
    //   xdxxx  xdxxx xdxx danh d
    //   xdxxx  xdxxx xdxxx danh d
    //   xdxxx  xdxxx xdxxx x danh x
    //   xdxxx  xdxxx xdxxx xd danh d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_8_4) {
      const pattern1 = "01000010000";
      const pattern2 = "10111101111";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_8_4;

        res.buy = isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_8_4) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt != 0 && (indexInt % 5 === 1 || indexInt % 5 === 0)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    //   * 8.5. Approach loop 5-5 (1-2-2)
    //   xddxx  xddxx x danh x
    //   xddxx  xddxx xd danh x
    //   xddxx  xddxx xdd danh d
    //   xddxx  xddxx xddx danh d
    //   xddxx  xddxx xddxx danh d
    //   xddxx  xddxx xddxx x danh x
    //   xddxx  xddxx xddxx xd danh x
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_8_5) {
      const pattern1 = "01100011000";
      const pattern2 = "10011100111";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_8_5;

        res.buy = isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_8_5) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt != 0 && (indexInt % 5 === 2 || indexInt % 5 === 0)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }

    //   * 8.6. Approach loop 5-5 (1-3-1)
    //   xdddx  xdddx xd danh x
    //   xdddx  xdddx xdd danh x
    //   xdddx  xdddx xddd danh d
    //   xdddx  xdddx xdddx danh d
    //   xdddx  xdddx xdddx x danh x
    //   xdddx  xdddx xdddx xd danh x
    //   xdddx  xdddx xdddx xdd danh x
    //   xdddx  xdddx xdddx xddd danh d
    if (this.lastStrategyMap[accountId] == 0 || this.lastStrategyMap[accountId] == TYPE_8_6) {
      const pattern1 = "011100111001";
      const pattern2 = "100011000110";
      const suffix = colorSequence.substr(colorSequence.length - pattern1.length);
      if (this.lastStrategyMap[accountId] == 0 &&
        (suffix == pattern1 || suffix == pattern2)) {
        this.currentIndexMap[accountId] = 0;
        this.lastStrategyMap[accountId] = TYPE_8_6;

        res.buy = !isGreen;

      } else if (this.lastStrategyMap[accountId] == TYPE_8_6) {
        // @nhancv 10/18/19: Check win to reset
        if (this.lastIsGreenMap[accountId] == isGreen) {
          this.currentIndexMap[accountId] = -1;
          this.lastStrategyMap[accountId] = 0;
          this.logicChecking(accountId, candles, res, isGreen, colorSequence);
        } else {
          this.currentIndexMap[accountId]++;

          const indexInt = parseInt(`${this.currentIndexMap[accountId]}`);
          res.buy = (indexInt != 0 && (indexInt % 5 === 2 || indexInt % 5 === 4)) ? !this.lastIsGreenMap[accountId] : this.lastIsGreenMap[accountId];

        }
      }
    }


  }

  convertColorToBuySignal(color: number): boolean {
    return color == 0;
  }

}
