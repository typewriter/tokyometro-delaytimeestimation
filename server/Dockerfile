FROM ruby:3.0-slim

WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle install
COPY Gemfile Gemfile.lock app.rb config.ru get_railway.rb /app/
EXPOSE 3001
ENV TZ=Asia/Tokyo

CMD ["bundle", "exec", "rackup", "-s", "webrick", "--host", "0.0.0.0", "--port", "3001"]

