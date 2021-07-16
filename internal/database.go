package internal

import (
	"context"

	"github.com/sanggonlee/plum"
)

// Database is an interface for talking to the Postgres DB
type Database interface {
	GetPGTables(context.Context, []string) ([]plum.TableState, error)
	GetUserTables(context.Context) (plum.Tables, error)
	GetTrackActivitiesSetting(context.Context) (string, error)
	GetCurrentNumLocks(context.Context) (int, error)
}
