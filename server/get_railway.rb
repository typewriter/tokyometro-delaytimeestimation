#!/usr/bin/env ruby

require "net/http"
require "uri"
require "json"
require "tempfile"
require "fileutils"

data_dir = File.dirname(__FILE__)

API_ENDPOINT = "https://api.tokyometroapp.jp/api/v2/datapoints"
CONSUMER_KEY = ENV['CONSUMER_KEY']


## 路線・駅情報の集約
json = Net::HTTP.get(URI.parse("#{API_ENDPOINT}?rdf:type=odpt:Station&acl:consumerKey=#{CONSUMER_KEY}"))
stations = JSON.parse(json)
station_map = stations.map { |station|
  [station["owl:sameAs"], { id: station["owl:sameAs"], name: station["dc:title"], stationCode: station["odpt:stationCode"] }]
}.to_h

sleep 10

json = Net::HTTP.get(URI.parse("#{API_ENDPOINT}?rdf:type=odpt:Railway&acl:consumerKey=#{CONSUMER_KEY}"))
railways = JSON.parse(json)
railways = railways.map { |railway|
  {
    railway: { id: railway["owl:sameAs"], name: railway["dc:title"] },
    stations: railway["odpt:stationOrder"].map { |station_order|
      station_map[station_order["odpt:station"]]
    }
  }
}

tempfile = Tempfile.create
tempfile.write JSON.generate(railways)
tempfile.close
FileUtils.mv(tempfile.path, File.join(data_dir, "railways.json"))

railways = JSON.parse(File.read("./railways.json"))

## 時刻表の取得
railways.each { |railway|
  sleep 10
  json = Net::HTTP.get(URI.parse("#{API_ENDPOINT}?rdf:type=odpt:TrainTimetable&acl:consumerKey=#{CONSUMER_KEY}&odpt:railway=#{railway["railway"]["id"]}"))
  timetables = JSON.parse(json)

  output_timetables = { weekdays: {}, saturdaysHolidays: {} }
  timetables.each { |timetable|
    key = (timetable["owl:sameAs"] =~ /SaturdaysHolidays/) ? :saturdaysHolidays : :weekdays
    output_timetables[key][timetable["odpt:train"]] = {
      type: timetable["odpt:trainType"],
      starting: timetable["odpt:startingStation"],
      terminal: timetable["odpt:terminalStation"],
      direction: timetable["odpt:railDirection"],
      dept_stops: timetable["odpt:#{key == :weekdays ? "weekdays": "holidays"}"].map { |stop|
        [stop["odpt:departureStation"], stop["odpt:departureTime"]]
      }.reject { |stop| !stop[0] }.to_h,
      arr_stops: timetable["odpt:#{key == :weekdays ? "weekdays": "holidays"}"].map { |stop|
        [stop["odpt:arrivalStation"], stop["odpt:arrivalTime"]]
      }.reject { |stop| !stop[0] }.to_h
    }
  }

  tempfile = Tempfile.create
  tempfile.write JSON.generate(output_timetables)
  tempfile.close

  filename = railway["railway"]["id"].gsub(/[\\\/:*?"<>|]/, "-")
  FileUtils.mv(tempfile.path, File.join(data_dir, "timetables.#{filename}.json"))
}

