require 'rubygems' unless defined? ::Gem
require File.dirname(__FILE__) + '/app.rb'

set :protection, :except => [:http_origin]

run Sinatra::Application
