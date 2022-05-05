.PHONY: app

init:
	docker-compose run --rm app yarn
	docker-compose up -d --build
up:
	docker-compose up -d
down:
	docker-compose down --remove-orphans
restart:
	@make down
	@make up
logs:
	docker-compose logs
logs-watch:
	docker-compose logs --follow
log-plantuml:
	docker-compose logs plantuml
log-plantuml-watch:
	docker-compose logs --follow plantuml
log-app:
	docker-compose logs app
log-app-watch:
	docker-compose logs --follow app
plantuml:
	docker-compose exec plantuml sh
app:
	docker-compose exec app sh
test:
	docker-compose exec app yarn test
