package http

import (
	"net/http"

	"github.com/pkg/errors"
)

// GetUserTables retrieves all the existing user tables (pg_stats_user_tables)
func (h *Handler) GetUserTables(w http.ResponseWriter, r *http.Request) {
	tables, err := h.Store.GetUserTables(r.Context())
	if err != nil {
		err = errors.Wrap(err, "getting user tables from store")
		h.Logger.Println("GetUserTables:", err)
		_ = sendErrorResponse(w, http.StatusInternalServerError, err)
		return
	}

	_ = sendResponse(w, http.StatusOK, tables)
}

// GetTrackActivitiesSetting retrieves the track_activities postgres setting.
func (h *Handler) GetTrackActivitiesSetting(w http.ResponseWriter, r *http.Request) {
	trackActivitiesSetting, err := h.Store.GetTrackActivitiesSetting(r.Context())
	if err != nil {
		err = errors.Wrap(err, "getting track_activities setting from store")
		h.Logger.Println("GetTrackActivitiesSetting:", err)
		_ = sendErrorResponse(w, http.StatusInternalServerError, err)
		return
	}

	isOn := trackActivitiesSetting == "on"

	_ = sendResponse(w, http.StatusOK, isOn)
}
