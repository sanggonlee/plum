package http

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/sanggonlee/plum/internal"
)

type Handler struct {
	Logger *log.Logger
	Store  internal.Store
}

// ListenAndServe is analogous to http.ListenAndServe, blocks and receives incoming requests.
func (h *Handler) ListenAndServe(addr string) error {
	return http.ListenAndServe(addr, h.Handler())
}

func sendResponse(w http.ResponseWriter, code int, body interface{}) error {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(code)
	return json.NewEncoder(w).Encode(body)
}

type errorResponse struct {
	Error string `json:"error"`
}

func sendErrorResponse(w http.ResponseWriter, code int, err error) error {
	return sendResponse(w, code, errorResponse{Error: err.Error()})
}
