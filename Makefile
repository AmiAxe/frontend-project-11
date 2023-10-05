install:
	npm install

install-deps:
	npm ci

lint:
	npx eslint .

publish:
	npm publish

build:
	rm -rf dist
	NODE_ENV=production npx webpack

serve:
	npx webpack serve
