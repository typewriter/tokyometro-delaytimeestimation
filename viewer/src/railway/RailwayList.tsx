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

  lineColor(id: string): string {
    let dict: any = {
      'odpt.Railway:TokyoMetro.Ginza': '#FF9500',
      'odpt.Railway:TokyoMetro.Marunouchi': '#F62E36',
      'odpt.Railway:TokyoMetro.Hibiya': '#B5B5AC',
      'odpt.Railway:TokyoMetro.Tozai': '#009BBF',
      'odpt.Railway:TokyoMetro.Chiyoda': '#00BB85',
      'odpt.Railway:TokyoMetro.Yurakucho': '#C1A470',
      'odpt.Railway:TokyoMetro.Hanzomon': '#8F76D6',
      'odpt.Railway:TokyoMetro.Namboku': '#00AC98',
      'odpt.Railway:TokyoMetro.Fukutoshin': '#9C5E31',
    };

    return (
      dict[id] || '#FFFFFF'
    );
  }

  render() {
    return (
      <div>
        { 
          this.props.railways.map((railway) => 
            <div className="mui--pull-left" style={{ padding: "5px 5px" }}>
              <div className="mui--bg-primary-dark mui--z1" style={{ cursor: "pointer" }} onClick={ () => this.railwayClick(railway.railway.id) } >
                <span style={{ color: this.lineColor(railway.railway.id) }}>■</span>
                { railway.railway.name }線
                </div>
            </div>
          )
        }
      </div>
    );
  }
}