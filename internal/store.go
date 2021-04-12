package internal

import (
	"context"

	"github.com/sanggonlee/plum"
)

// Store is an interface for talking to the Postgres DB
type Store interface {
	GetPGTables(context.Context, []string) ([]plum.TableState, error)
	GetUserTables(context.Context) (plum.Tables, error)
	GetTrackActivitiesSetting(context.Context) (string, error)
}
