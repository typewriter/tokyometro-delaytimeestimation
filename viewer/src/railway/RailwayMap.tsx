import React from 'react';

export type Station = {
  id: string;
  name: string;
  stationCode: string;
}

export type Railway = {
  id: string;
  name: string;
}

type RailwayProps = {
  railway: Railway;
  stations: Station[];
}

export class RailwayMap extends React.PureComponent<RailwayProps, any> {
  render() {
    return (
      <div>
        <div className="mui--appbar-line-height">
          <span className="mui--text-subhead">{ this.props.railway.name }</span> 平常通り運転しています
        </div>
        <div>
          { this.props.stations.map((station) => 
            <div className="mui--overflow-hidden mui--text-nowrap">
              <div className="mui-row"> 
                <div className="mui-col-xs-4">▲各停 渋谷 +01</div>
                <div className="mui-col-xs-4 mui--text-center mui--bg-primary mui--text-light">
                  { station.name }
                </div>
                <div className="mui-col-xs-4">▼各停 浅草 +04</div>
              </div>
              <div className="mui-row"> 
                <div className="mui-col-xs-4">▲各停 渋谷 +01</div>
                <div className="mui-col-xs-4 mui--text-center"></div>
                <div className="mui-col-xs-4">▼各停 浅草 +02</div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}