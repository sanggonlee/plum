package postgres

import (
	"context"

	"github.com/pkg/errors"
)

func (p *Postgres) GetTrackActivitiesSetting(ctx context.Context) (string, error) {
	var trackActivitiesSetting string
	if err := p.db.QueryRowContext(ctx, "SHOW track_activities").
		Scan(&trackActivitiesSetting); err != nil {
		return "", errors.Wrap(err, "querying tracking activities setting")
	}

	return trackActivitiesSetting, nil
}
