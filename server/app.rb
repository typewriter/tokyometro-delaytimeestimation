#!/usr/bin/env ruby

require "sinatra"
require "sinatra/json"
require "sinatra/namespace"

require "holiday_japan"

require "net/http"
require "uri"
require "tempfile"
require "fileutils"
require "time"
require "date"

require "rufus-scheduler"

# scheduler = Rufus::Scheduler.new
# scheduler.every '3s' do
#   puts 'Hello!'
# end

DELAY_CACHE = "/tmp/metro_delay.cache"
DATA_DIR = File.dirname(__FILE__)
LATEST_TIME = File.join(DATA_DIR, "latest.time")
API_ENDPOINT = "https://api.tokyometroapp.jp/api/v2/datapoints"
FORCE_API_ENDPOINT = "https://api.tokyometroapp.jp/api/v2a/datapoints"
CONSUMER_KEY = ENV['CONSUMER_KEY']

def railways
  JSON.parse(File.read(File.join(DATA_DIR, "railways.json"))).reject { |railway| railway["railway"]["id"] =~ /MarunouchiBranch/ }
end

def timetables(id)
  filename = id.gsub(/[\\\/:*?"<>|]/, "-")
  JSON.parse(File.read(File.join(DATA_DIR, "timetables.#{filename}.json")))
end

def traininformations(id)
  filename = id.gsub(/[\\\/:*?"<>|]/, "-")
  JSON.parse(File.read(File.join(DATA_DIR, "traininformations.#{filename}.json")))
end

def trains(id)
  filename = id.gsub(/[\\\/:*?"<>|]/, "-")
  filepath = File.join(DATA_DIR, "trains.#{filename}.json")

  # 次のケースを考慮する
  # - 未取得の場合
  # - パース出来ないデータの場合
  # - 期限切れの場合
  is_need_to_update = false
  is_need_to_update ||= !File.exist?(filepath)

  if File.exist?(filepath)
    begin
      json = JSON.parse(File.read(filepath))
      is_need_to_update ||= !json.dig(0, "dct:valid") || Time.now > Time.parse(json.first["dct:valid"]) + 5
    rescue
      is_need_to_update = true
    end
  end

  if is_need_to_update && (!File.exist?(LATEST_TIME) || Time.now - File.mtime(LATEST_TIME) > 15)
    FileUtils.touch(LATEST_TIME)

    body = Net::HTTP.get(URI.parse("#{API_ENDPOINT}?rdf:type=odpt:Train&acl:consumerKey=#{CONSUMER_KEY}"))
    force_body = nil
    begin
      json = JSON.parse(body)
      force_json = nil

      railways.each { |railway|
        railway_filename = railway["railway"]["id"].gsub(/[\\\/:*?"<>|]/, "-")
        railway_json = json.select { |train| train["odpt:railway"] == railway["railway"]["id"] }

        if railway_json.empty?
          STDERR.puts "Use alternative API for #{railway["railway"]["id"]}"
          force_body = Net::HTTP.get(URI.parse("#{FORCE_API_ENDPOINT}?rdf:type=odpt:Train&acl:consumerKey=#{CONSUMER_KEY}")) if !force_body
          force_json = JSON.parse(body) if !force_json
          railway_json = force_json.select { |train| train["odpt:railway"] == railway["railway"]["id"] }
        end

        tempfile = Tempfile.create
        tempfile.write JSON.generate(railway_json)
        tempfile.close
        FileUtils.mv(tempfile.path, File.join(DATA_DIR, "trains.#{railway_filename}.json"))
      }
    rescue

    end

    body = Net::HTTP.get(URI.parse("#{API_ENDPOINT}?rdf:type=odpt:TrainInformation&acl:consumerKey=#{CONSUMER_KEY}"))
    force_body = nil
    begin
      json = JSON.parse(body)
      force_json = nil

      railways.each { |railway|
        railway_filename = railway["railway"]["id"].gsub(/[\\\/:*?"<>|]/, "-")
        railway_json = json.select { |train| train["odpt:railway"] == railway["railway"]["id"] }&.first

        tempfile = Tempfile.create
        tempfile.write JSON.generate(railway_json)
        tempfile.close
        FileUtils.mv(tempfile.path, File.join(DATA_DIR, "traininformations.#{railway_filename}.json"))
      }
    rescue

    end
  end

  begin
    json = JSON.parse(File.read(filepath))
  rescue
    []
  end
end

namespace '/metro_delay_now/api/v1' do
  get '/railways' do
    json railways
  end

  get '/trains/:id' do
    if !railways.any? { |railway| railway.dig("railway", "id") == params[:id] }
      halt 400
    end

    date = Time.now.to_date - (Time.now.hour < 4 ? 1 : 0)
    day_of = (date.saturday? || date.sunday? || HolidayJapan.check(date)) ? "saturdaysHolidays" : "weekdays"
    timetables = timetables(params[:id])
    trains = trains(params[:id])

    out_trains = trains.map { |train|
      {
        id: train["owl:sameAs"],
        trainType: train["odpt:trainType"],
        starting: train["odpt:startingStation"],
        terminal: train["odpt:terminalStation"],
        direction: train["odpt:railDirection"],
        current: train["odpt:fromStation"],
        next: train["odpt:toStation"],
        delay: train["odpt:delay"] / 60 || 0,
        delay_method: "Official"
        # timetable: timetables[day_of][train["owl:sameAs"]]
      }.tap { |out_train|
        if timetable = timetables.dig(day_of, train["owl:sameAs"])
          # 発車済の場合は次駅時間、未発車の場合は当駅時間で
          current_time = train["dc:date"]
          planned_time = timetable.dig("dept_stops", out_train[:next] || out_train[:current]) ||
                         timetable.dig("arr_stops", out_train[:next])
          if !current_time || !planned_time
            break out_train
          end

          current_time = Time.parse(current_time)
          planned_time = Time.parse(planned_time)

          if current_time - planned_time > 60
            out_train[:delay_method] = "Estimate"
            out_train[:delay] = [out_train[:delay], ((current_time - planned_time) / 60).to_i].max
            out_train[:delay] = [0, out_train[:delay]-1440].max if out_train[:delay] > 1080 # 23:53で00:00発予定
          elsif current_time - planned_time < -1080*60
            out_train[:delay_method] = "Estimate"
            out_train[:delay] = [out_train[:delay], (((current_time - planned_time) / 60) + 1440).to_i].max # 00:05で23:53発予定
          else
            out_train[:delay_method] = "Estimate"
            out_train[:delay] = 0
          end

          # 移動中で前駅の遅延情報が残っている場合は、それを用いる
          if out_train[:next]
            if File.exist?(DELAY_CACHE)
              delays = File.readlines(DELAY_CACHE)
              select_delays = delays.select { |delay| delay.start_with?("#{out_train[:id]},#{out_train[:current]}") }
              if !select_delays.empty?
                out_train[:delay_method] = "EstimateWithBeforeStation"
                out_train[:delay] = [out_train[:delay], select_delays.last.split(/,/)[2].to_i].max
              end
            end
          end

          if out_train[:delay] > 0 && !out_train[:next]
            # 書き込み
            `touch #{DELAY_CACHE}`
            `tail -n 1000 #{DELAY_CACHE} > #{DELAY_CACHE}.tmp`
            `echo "#{out_train[:id]},#{out_train[:current]},#{out_train[:delay]}" >> #{DELAY_CACHE}.tmp`
            `mv #{DELAY_CACHE}.tmp #{DELAY_CACHE}`
          end
        end
      }
    }

    json({ date: trains.dig(0, "dc:date"), trains: out_trains, information: traininformations(params[:id])&.dig("odpt:trainInformationText") })
  end

  get '/' do
    "Hello, world!"
  end
end
