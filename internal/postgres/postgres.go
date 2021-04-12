package postgres

import (
	"database/sql"
	"io"
	"strconv"
	"strings"

	_ "github.com/lib/pq"
	"github.com/pkg/errors"
)

// Options for Postgres.
type Options struct {
	DisableSSL bool
	Host       string
	Port       int
	Database   string
	Username   string
	Password   string
}

// New instantiates a new Postgres instance.
func New(o Options) (*Postgres, error) {
	db, err := sql.Open("postgres", connStrFromOptions(o))
	if err != nil {
		return nil, errors.Wrap(err, "opening db")
	}

	return &Postgres{db}, nil
}

// Postgres is a wrapper around DB pool to Postgres.
type Postgres struct {
	db *sql.DB
}

func connStrFromOptions(o Options) string {
	var sslmode string
	if o.DisableSSL {
		sslmode = "disable"
	} else {
		sslmode = "require"
	}

	var port string
	if o.Port > 0 {
		port = strconv.Itoa(o.Port)
	}

	var b strings.Builder
	writeConnStrParam(&b, "dbname", o.Database)
	writeConnStrParam(&b, "host", o.Host)
	writeConnStrParam(&b, "password", o.Password)
	writeConnStrParam(&b, "port", port)
	writeConnStrParam(&b, "sslmode", sslmode)
	writeConnStrParam(&b, "user", o.Username)
	return b.String()
}

func writeConnStrParam(w io.StringWriter, name, value string) { //nolint:interfacer
	if value == "" {
		return
	}
	_, _ = w.WriteString(name)
	_, _ = w.WriteString("='")
	_, _ = w.WriteString(strings.Replace(value, "'", `\'`, -1))
	_, _ = w.WriteString("' ")
}
