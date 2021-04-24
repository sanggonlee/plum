run-server:
	@source ./env.sh && go run cmd/server/main.go

run-ui:
	@source ./env.sh && cd ui && npm start
