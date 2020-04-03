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


import {Request, Response} from 'express'
import TigerOrder from "../Order/TigerOrder";
import BaseOrder from "../Order/BaseOrder";
import IResponse from "../Model/IResponse";
import IStrategyReq from "../Model/IStrategyReq";
import IStrategyRes from "../Model/IStrategyRes";
import CosamOrder from "../Order/CosamOrder";
import IStrategyResult from "../Model/IStrategyResult";

const AUTH_TOKEN = process.env.AUTHENTICATION_TOKEN ? process.env.AUTHENTICATION_TOKEN : '';

// @nhancv 10/13/19: Check null and undefined
const isNull = (input: any): boolean => {
  return input === null || input === undefined
};

// @nhancv 10/13/19: Check string empty
const isEmpty = (input: any): boolean => {
  return isNull(input) || input.length === 0;
};

// @nhancv 10/13/19: Check boolean type
const isBoolean = (input: any) => {
  return input === false || input === true;
};

const isString = (input: any) => {
  return Object.prototype.toString.call(input) === "[object String]"
};

export interface IStrategy {
  getStrategy(req: Request, res: Response): Promise<any>

  cleanStrategy(req: Request, res: Response): Promise<any>
}


export class Strategy implements IStrategy {

  /**
   * Get order by id
   * @param strategyId
   */
  uniqueOrder = (strategyId: string | undefined): BaseOrder | null => {
    let orderStrategy: BaseOrder | null = null;
    if (strategyId === TigerOrder.order_id) {
      orderStrategy = TigerOrder.instance;
    } else if (strategyId === CosamOrder.order_id) {
      orderStrategy = CosamOrder.instance;
    }
    return orderStrategy;
  };
  /**
   * Client request format
   * PUT: /api/strategy
   * clean
   * @param req
   * @param res
   */
  cleanStrategy = async (req: Request, res: Response): Promise<any> => {
    const errorRes: IResponse = {
      code: 500,
      body: 'Fuck you.'
    };
    const token: string | undefined = req.header('token');
    const strategyId: string | undefined = req.body["strategyId"];
    const accountId: string | undefined = req.body["accountId"];
    if (isEmpty(token) || AUTH_TOKEN !== token || isEmpty(strategyId) || isEmpty(accountId)) {
      return res.status(errorRes.code).json(errorRes);
    }
    // @nhancv 10/13/19: Get strategy
    let orderStrategy: BaseOrder | null = this.uniqueOrder(strategyId);

    // @nhancv 10/13/19: Execute strategy
    if (accountId === undefined || orderStrategy === null) {
      return res.status(errorRes.code).json({...errorRes, body: 'Strategy is not valid.'});
    } else {
      orderStrategy.clean(accountId);
      const ok: IResponse = {
        code: 200,
        body: `Clean cache ${accountId} ${strategyId} ok`
      };
      return res.status(ok.code).json(ok);
    }
  };
  /**
   * Client request format
   * POST: /api/strategy
   * body with IStrategyReq
   * @param req
   * @param res
   */
  getStrategy = async (req: Request, res: Response): Promise<any> => {
    try {
      const errorRes: IResponse = {
        code: 500,
        body: 'Fuck you.'
      };
      const token: string | undefined = req.header('token');
      let body: IStrategyReq | undefined = undefined;
      try {
        body = {
          strategyId: String(req.body.strategyId),
          isGreen: Boolean(req.body.isGreen),
          candles: Number(req.body.candles),
          colorList: ((isString(req.body.colorList) ? (JSON.parse(req.body.colorList)) : req.body.colorList).map(i => Number(i))),
          accountId: String(req.body.accountId),
          accountAmounts: ((isString(req.body.accountAmounts) ? (JSON.parse(req.body.accountAmounts)) : req.body.accountAmounts).map(i => Number(i)))
        };
      } catch (e) {
        console.error(e.message);
        return res.status(errorRes.code).json(errorRes);
      }
      if (isEmpty(token) || AUTH_TOKEN !== token || isNull(body)) {
        return res.status(errorRes.code).json(errorRes);
      }
      // @nhancv 10/13/19: Safe type check
      if (isEmpty(body.strategyId) ||
        isEmpty(body.isGreen) ||
        isEmpty(body.candles) ||
        isEmpty(body.accountId) ||
        isEmpty(body.accountAmounts)) {
        return res.status(errorRes.code).json(errorRes);
      }

      // @nhancv 10/13/19: Get strategy
      let orderStrategy: BaseOrder | null = this.uniqueOrder(body.strategyId);

      // @nhancv 10/13/19: Execute strategy
      if (orderStrategy === null) {
        return res.status(errorRes.code).json({...errorRes, body: 'Strategy is not valid.'});
      } else {
        const result: IStrategyResult = orderStrategy.apply(body.isGreen, body.candles, body.colorList, body.accountId, body.accountAmounts);
        console.log(`${body.accountId} ${body.strategyId} checking [G:${body.isGreen},C:${body.candles}] => [B:${result.buy},A:${result.amount}]`);
        let response: IStrategyRes = {
          code: 200,
          body: {
            buy: result.buy,
            amount: result.amount,
            data: result.data
          }
        };
        return res.status(response.code).json(response);
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json('Error');
    }
  }
}
