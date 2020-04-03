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

/**
 * This strategy will make an order next candle will same color with current.
 * Ex: amount = 1 2 5 10 20
 * current is Green, will order $1 for Green.
 * current is Red, will order $1 for Red.
 * If lose increase amount for the next.
 */
export default class TigerOrder implements BaseOrder {
  static order_id = 'tiger_order';
  // @nhancv 10/14/19: IMPORTANT - Order strategy must be singleton to keep config live
  static instance: TigerOrder = new TigerOrder();
  // @nhancv 9/18/19: Save current index of amount array with key is accountId
  currentIndexMap: {};
  // @nhancv 9/18/19: This flag present for in order sequence or not
  inOrderSequenceMap: {};
  // @nhancv 9/21/19: Save last amount candles
  lastAmountCandleMap: {};
  // @nhancv 10/15/19: data-store for local caching
  store = require('data-store')({ path: process.cwd() + `/cache/${TigerOrder.order_id}.json` });

  constructor() {
    this.currentIndexMap = {};
    this.inOrderSequenceMap = {};
    this.lastAmountCandleMap = {};
  }

  // @nhancv 10/14/19: Clean properties
  clean(accountId: string) {
    if (accountId == "all") {
      this.clearAll();
    } else {
      // @nhancv 10/14/19: Reset default value
      this.currentIndexMap[accountId] = -1;
      this.inOrderSequenceMap[accountId] = false;
      this.lastAmountCandleMap[accountId] = -1;

      // @nhancv 10/14/19: Delete property
      delete this.currentIndexMap[accountId];
      delete this.inOrderSequenceMap[accountId];
      delete this.lastAmountCandleMap[accountId];

      this.store.del(accountId);
    }
  }

  // @nhancv 10/15/19: Clear all cache
  clearAll() {
    this.currentIndexMap = {};
    this.inOrderSequenceMap = {};
    this.lastAmountCandleMap = {};
    this.store.clear();
  }

  // @nhancv 10/14/19: Apply strategy
  apply(isGreen: boolean, candles: number, colorList: number[], accountId: string, accountAmounts: number[]): { buy: boolean, amount: number } {

    ////// RESTORE FROM CACHE //////
    // @nhancv 10/15/19: Restore from local caching
    let configCaching = this.store.get(accountId);
    if (configCaching) {
      this.currentIndexMap[accountId] = configCaching.currentIndexMap;
      this.inOrderSequenceMap[accountId] = configCaching.inOrderSequenceMap;
      this.lastAmountCandleMap[accountId] = configCaching.lastAmountCandleMap;
    }

    ////// INIT CONFIG DATA //////
    // @nhancv 9/18/19: Init index
    if (!this.currentIndexMap.hasOwnProperty(accountId)) {
      this.currentIndexMap[accountId] = -1;
    }
    // @nhancv 9/18/19: Init in order map
    if (!this.inOrderSequenceMap.hasOwnProperty(accountId)) {
      this.inOrderSequenceMap[accountId] = false;
    }
    // @nhancv 9/26/19: Init last amount candle map
    if (!this.lastAmountCandleMap.hasOwnProperty(accountId)) {
      this.lastAmountCandleMap[accountId] = -1;
    }

    ////// LOGIC //////

    // @nhancv 9/21/19: Increase index
    this.currentIndexMap[accountId]++;

    if (candles == 1) {
      // @nhancv 9/21/19: Delay 1 min after long sequence color.
      if (this.lastAmountCandleMap[accountId] > candles) {
        this.currentIndexMap[accountId] = -1;
        this.inOrderSequenceMap[accountId] = false;
      } else {
        // @nhancv 9/21/19: In normal mode
        if (this.currentIndexMap[accountId] >= 0 &&
          this.currentIndexMap[accountId] < accountAmounts.length) {
          this.inOrderSequenceMap[accountId] = true;
        } else {
          // @nhancv 9/21/19: In stop loss
          this.inOrderSequenceMap[accountId] = false;
          // @nhancv 9/21/19: Delay after cut loss
          if (this.currentIndexMap[accountId] >= 0) {
            this.currentIndexMap[accountId] = -10;
          }
        }
      }
    } else {
      // @nhancv 9/18/19: If current candle same color with last candle reset index = 0 => will order $1 at all
      // If index = 0 mean ready for order, and current color different with last candle color, order will be in sequence
      // Ex: amountArr 1 2 5
      // Current index = 2 => amount = 5 at candle 3rd
      // If amount of candle continuous increase to > 3 => Need reset index = 0
      this.inOrderSequenceMap[accountId] = false;
      // @nhancv 9/18/19: Only reset index when it > 0, because when in stop loss need delay time.
      if (this.currentIndexMap[accountId] > 0) {
        this.currentIndexMap[accountId] = 0;
      }
    }
    // @nhancv 9/21/19: Save last amount candles
    this.lastAmountCandleMap[accountId] = candles;

    ////// FINAL AMOUNT //////
    // @nhancv 9/18/19: Get amount from index
    let res = {buy: false, amount: 0};
    if (this.currentIndexMap[accountId] >= 0 && this.currentIndexMap[accountId] < accountAmounts.length) {
      let amount = accountAmounts[this.currentIndexMap[accountId]];
      if (amount > 0) {
        res = {buy: isGreen, amount: amount};
      }
    }

    ////// SAVE TO CACHE //////
    // @nhancv 10/15/19: Save config to local
    this.store.set(accountId, {
      currentIndexMap: this.currentIndexMap[accountId],
      inOrderSequenceMap: this.inOrderSequenceMap[accountId],
      lastAmountCandleMap: this.lastAmountCandleMap[accountId]
    });

    return res;
  }
}
