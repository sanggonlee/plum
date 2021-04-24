package http

import (
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
)

const (
	urlParamFilename = "filename"
)

// Handler sets up the router for APIs
func (h *Handler) Handler() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Route("/user_tables", func(r chi.Router) {
		r.Get("/", h.GetUserTables)
	})

	r.Route("/timeseries", func(r chi.Router) {
		r.Get("/", h.StartTimeseriesConnection)
		r.Get("/replay", h.StartTimeseriesReplayConnection)
		r.Get("/download/{"+urlParamFilename+"}", h.DownloadTimeseriesDataFile)
		r.Post("/upload", h.UploadTimeseriesDataFile)
	})

	r.Route("/pg_settings", func(r chi.Router) {
		r.Get("/track_activities", h.GetTrackActivitiesSetting)
	})

	return r
}
