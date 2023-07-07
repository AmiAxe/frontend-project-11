install: # установка зависимостей
	npm ci
lint: # запуск линтера
	npx eslint
build: # билд проекта
	npm run build
serve: # запуск веб-сервера
	npm run serve