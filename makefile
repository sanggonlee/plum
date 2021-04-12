run-server:
	@source ./env.sh && go run cmd/server/main.go

run-ui:
	@cd ui && npm start
