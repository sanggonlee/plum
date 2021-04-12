package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/sanggonlee/plum"

	"github.com/sanggonlee/pogo"
	"github.com/sanggonlee/pogo/postgres13"
	"gopkg.in/guregu/null.v3"

	"github.com/pkg/errors"
)

// GetPGTables gets the user tables with their current activities and locks.
func (p *Postgres) GetPGTables(ctx context.Context, relations []string) ([]plum.TableState, error) {
	var where string
	if len(relations) > 0 {
		where = fmt.Sprintf("pg_stat_user_tables.relname = ANY('{%s}')", strings.Join(relations, ","))
	}

	tables, err := pogo.Query(p.db).StatTable13(
		where,
		pogo.LocksView.With(
			pogo.StatActivityView.With(
				pogo.BlockingPIDs,
			),
		),
	)
	if err != nil {
		return nil, errors.Wrap(err, "querying pg stats tables")
	}

	tableStates := make([]plum.TableState, 0, len(tables))
	for _, t := range tables {
		tableState := plum.TableState{
			StatTableJoined: postgres13.StatTableJoined{StatTable: t.StatTable},
			Processes:       make([]postgres13.StatActivityJoined, 0),
		}

		// Invert activities <-> locks hierarchy
		processMap := make(map[null.Int]*postgres13.StatActivityJoined)
		for _, l := range t.Locks {
			if l.RowTraceable() {
				l.LockedRow, err = pogo.Query(p.db).Tuple(ctx, pogo.TupleArgs{
					RelName: t.RelName.String,
					Page:    l.Page.Int64,
					Tuple:   l.Tuple.Int64,
				})
				if err != nil {
					return nil, errors.Wrap(err, "querying locked rows")
				}
			}

			for _, a := range l.Activities {
				_, ok := processMap[a.PID]
				if !ok {
					processMap[a.PID] = &a
				}
				process := processMap[a.PID]
				process.Locks = append(
					process.Locks,
					postgres13.LockJoined{
						Lock:      l.Lock,
						LockedRow: l.LockedRow,
					}, // Removing other children
				)
			}
		}

		for _, p := range processMap {
			tableState.Processes = append(tableState.Processes, *p)
		}

		tableStates = append(tableStates, tableState)
	}

	return tableStates, nil
}

// GetUserTables fetches all the rows from pg_stat_user_tables view.
func (p *Postgres) GetUserTables(ctx context.Context) (plum.Tables, error) {
	tables, err := pogo.Query(p.db).StatTable13("")
	if err != nil {
		return nil, errors.Wrap(err, "querying pg stats tables")
	}

	return plum.Tables(tables), nil
}
