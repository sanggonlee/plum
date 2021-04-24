package postgres

import (
	"database/sql"
	"fmt"
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

	if err = db.Ping(); err != nil {
		return nil, errors.Wrap(err, "connection failure")
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
	b.WriteString(fmt.Sprintf("dbname='%s'", o.Database))
	b.WriteString(fmt.Sprintf("host='%s'", o.Host))
	b.WriteString(fmt.Sprintf("port='%s'", port))
	b.WriteString(fmt.Sprintf("user='%s'", o.Username))
	b.WriteString(fmt.Sprintf("password='%s'", o.Password))
	b.WriteString(fmt.Sprintf("sslmode='%s'", sslmode))
	return b.String()
}
