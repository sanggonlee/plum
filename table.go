package plum

import "github.com/sanggonlee/pogo/postgres13"

// Tables is an alias to a slice of postgres13.StatTable (pg_stat_user_tables).
type Tables []postgres13.StatTableJoined
