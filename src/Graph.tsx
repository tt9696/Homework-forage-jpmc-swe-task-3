import React, { Component } from 'react';
import { Table, TableData  } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
        // Get element from the DOM.
        const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

        const schema = {
            price_abc: 'float',
            price_def: 'float',
            ratio: 'float',
            /* stock: 'string',
            top_ask_price: 'float',
            top_bid_price: 'float',*/
            timestamp: 'date',
            upper_bound: 'float',
            lower_bound:'float',
            trigger_alert:'float',
        
        };

        if (window.perspective && window.perspective.worker()) {
          this.table = window.perspective.worker().table(schema);
        }
        if (this.table) {
          // Load the `table` in the `<perspective-viewer>` DOM reference.
          elem.load(this.table);
          elem.setAttribute('view', 'y_line');
          elem.setAttribute('row-pivots', '["timestamp"]'); //x-axis
          elem.setAttribute('columns', '["ratio","lower_bound","upper_bound","trigger_alert"]');//focus on a particular part of a datapoint�s data along the y-axis  
          //---------- Removed column-pivots because only need ratios between the two stocks and not their separate prices ---------
          //elem.setAttribute('column-pivots', '["stock"]'); 
          //elem.setAttribute('columns', '["top_ask_price"]');
          //---- aggregates->handle the duplicate data we observed in task 2 and consolidate them into one data point. ---------------
          elem.setAttribute('aggregates', JSON.stringify({
            /*stock: 'distinctcount',
            top_ask_price: 'avg',
            top_bid_price: 'avg',*/
            price_abc: 'avg',
            price_def: 'avg',
            ratio: 'avg',
            timestamp: 'distinct count',
            upper_bound: 'avg',
            lower_bound: 'avg',
            trigger_alert: 'avg',    
          }));
        }
  }
  
  //as unknown as TableData is a double type cast. First, it casts the array to unknown, and then to TableData.
  componentDidUpdate() {
    if (this.table) {
        this.table.update([
            DataManipulator.generateRow(this.props.data),
        ] as unknown as TableData);
    }
  }
}

export default Graph;
