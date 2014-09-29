UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = "/*! Backbone Validater - MIT License - https://github.com/rafinskipg/Backbone.Validater */"
KARMA = ./node_modules/karma/bin/karma

default:	test

test:	karma build

karma:
	$(KARMA) start

build:
	$(UGLIFYJS) app/main.js --mangle --preamble $(BANNER) > dist/Backbone.Validater.min.js

loc:
	wc -l app/main.js

publish: test build
	git push --tags origin HEAD:master