//responsible for processing the raw stock data we receive from the server before the Graph component renders it.
import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
 /* stock: string,
  top_ask_price: number,*/
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
  // return object must correspond to the schema of the table in the Graph component
}

/*export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]) {
    return serverResponds.map((el: any) => {
      return {
        stock: el.stock,
        top_ask_price: el.top_ask && el.top_ask.price || 0,
        timestamp: el.timestamp,
      };
    })
  }
}*/
export class DataManipulator {


    static generateRow(serverRespond: ServerRespond[]): Row {
        const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
        const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
        const ratio = priceABC / priceDEF;
        const upperBound = 1 + 0.05;
        const lowerBound = 1 - 0.05;


        /*const historicalAverageRatio = 1.05;
        const upperBound = historicalAverageRatio * 1.1;  // 10% above the historical average
        const lowerBound = historicalAverageRatio * 0.9;  // 10% below the historical average*/

        return {
            price_abc: priceABC,
            price_def: priceDEF,
            ratio,
            timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
                serverRespond[0].timestamp : serverRespond[1].timestamp,
            upper_bound: upperBound,
            lower_bound: lowerBound,
            trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
            //trigger_alert: has a value (e.g. the ratio) if the threshold is passed by the ratio. Otherwise if the ratio remains within the threshold, no value/undefined will suffice.
        };
    }
}
