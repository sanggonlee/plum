package plum

import (
	"time"

	"github.com/sanggonlee/pogo/postgres13"
)

// Bucket represents the root bucket data model for timeseries.
type Bucket struct {
	TStart      time.Time    `json:"t_start"`
	TEnd        time.Time    `json:"t_end"`
	TableStates []TableState `json:"table_states"`
}

// TableState represents a data snapshot of a table's state, including processes
// interacting with it.
type TableState struct {
	postgres13.StatTableJoined
	Processes postgres13.StatActivities `json:"processes"`
}
