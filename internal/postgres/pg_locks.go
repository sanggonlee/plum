package postgres

import (
	"context"

	"github.com/pkg/errors"
)

// GetCurrentNumLocks returns the number of locks currently held by the db.
func (p *Postgres) GetCurrentNumLocks(ctx context.Context) (int, error) {
	var numLocks int
	if err := p.db.QueryRowContext(ctx, `
		SELECT count(*)
		FROM pg_locks
	`).Scan(&numLocks); err != nil {
		return 0, errors.Wrap(err, "querying the count of pg_locks")
	}

	return numLocks, nil
}
