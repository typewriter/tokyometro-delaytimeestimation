FROM ruby:2.7-slim

WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY Gemfile Gemfile.lock app.rb config.ru get_railway.rb /app/
EXPOSE 3001

CMD ["bundle", "exec", "rackup", "--host", "0.0.0.0", "--port", "3001"]

