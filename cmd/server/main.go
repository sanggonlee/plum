package main

import (
	"fmt"
	"log"
	"os"

	"github.com/kelseyhightower/envconfig"
	"github.com/sanggonlee/plum/internal/http"
	"github.com/sanggonlee/plum/internal/postgres"
	"github.com/sanggonlee/pogo"
)

type configs struct {
	Port              int    `required:"false" envconfig:"port"`
	AllowedOrigins    string `required:"true" envconfig:"allowed_origins"`
	LogTimeseriesData bool   `required:"false" envconfig:"log_timeseries_data" default:"false"`
	PostgresHost      string `required:"true" envconfig:"postgres_host"`
	PostgresPort      int    `required:"false" envconfig:"postgres_port"`
	PostgresDB        string `required:"true" envconfig:"postgres_db"`
	PostgresUser      string `required:"true" envconfig:"postgres_user"`
	PostgresPass      string `required:"true" envconfig:"postgres_pass"`
	PostgresVersion   int    `required:"false" envconfig:"postgres_version" default:"13"`
}

func main() {
	var c configs
	if err := envconfig.Process("plum", &c); err != nil {
		panic(err)
	}

	l := newLogger()
	p := newPostgres(c)
	h := newHandler(c, p, l)

	setPogoPostgresVersion(l, c)

	address := fmt.Sprintf(":%d", c.Port)
	l.Println("Plum server listening on", address)
	panic(h.ListenAndServe(address))
}

func newLogger() *log.Logger {
	return log.New(os.Stderr, "\u001b[35m[plum]\u001b[0m ", 0)
}

func newPostgres(c configs) *postgres.Postgres {
	p, err := postgres.New(postgres.Options{
		DisableSSL: true,
		Host:       c.PostgresHost,
		Database:   c.PostgresDB,
		Port:       c.PostgresPort,
		Username:   c.PostgresUser,
		Password:   c.PostgresPass,
	})
	if err != nil {
		panic(err)
	}

	return p
}

func newHandler(c configs, p *postgres.Postgres, l *log.Logger) *http.Handler {
	return &http.Handler{
		AllowedOrigins:    c.AllowedOrigins,
		LogTimeseriesData: c.LogTimeseriesData,
		Logger:            l,
		Database:          p,
	}
}

func setPogoPostgresVersion(l *log.Logger, c configs) {
	var v pogo.PostgresVersion
	switch c.PostgresVersion {
	case 9:
		v = pogo.Postgres9
	case 13:
		v = pogo.Postgres13
	default:
		panic(fmt.Sprintf("Unsupported Postgres version: %d", c.PostgresVersion))
	}

	if err := pogo.SetPostgresVersion(v); err != nil {
		panic(err)
	}

	l.Printf("Postgres version locked down to v%s", v)
}
