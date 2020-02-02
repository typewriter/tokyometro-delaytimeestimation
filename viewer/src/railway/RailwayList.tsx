import React from 'react';
import { RailwayProps } from './RailwayMap';

type RailwayListProps = {
  railways: RailwayProps[];
  railwayClick: Function;
}

export class RailwayList extends React.PureComponent<RailwayListProps> {
  railwayClick(id: string) {
    this.props.railwayClick(id);
  }

  render() {
    return (
      <div>
        { 
          this.props.railways.map((railway) => 
            <div className="mui--pull-left">
              <div className="mui--divider-left mui--bg-primary-dark mui--z1" style={{ cursor: "pointer" }} onClick={ () => this.railwayClick(railway.railway.id) } >&nbsp;{ railway.railway.name }線&nbsp;</div>
            </div>
          )
        }
      </div>
    );
  }
}