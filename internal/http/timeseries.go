package http

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/sanggonlee/plum"

	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
)

const (
	wsReadBufSize  = 2048
	wsWriteBufSize = 2048
)

const (
	defaultTimeseriesInterval = 1 * time.Second
)

var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  wsReadBufSize,
	WriteBufferSize: wsWriteBufSize,
}

// TimeseriesParams specifies the optional parameters for fetching timeseries data.
type TimeseriesParams struct {
	Interval  time.Duration
	Relations []string
}

// StartTimeSeriesConnection establishes a websocket connection for sending timeseries data
func (h *Handler) StartTimeSeriesConnection(w http.ResponseWriter, r *http.Request) {
	params, err := h.parseTimeseriesParams(r)
	if err != nil {
		_ = sendErrorResponse(w, http.StatusBadRequest, err)
		return
	}

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		err = errors.Wrap(err, "instantiating ws connection")
		h.Logger.Println("Error:", err)
		_ = sendErrorResponse(w, http.StatusInternalServerError, err)
		return
	}
	defer conn.Close()

	go func() {
		// Close the connection when it starts failing to read from client
		if _, _, err := conn.ReadMessage(); err != nil {
			conn.Close()
			return
		}
	}()

	ticker := time.NewTicker(params.Interval)
	defer ticker.Stop()

	for t := range ticker.C {
		w, err := conn.NextWriter(websocket.TextMessage)
		if err != nil {
			err = errors.Wrap(err, "getting next writer")
			h.Logger.Println("Error:", err)
			return
		}

		ctx := context.Background()
		bucket, err := h.getPGTablesSnapshot(ctx, params.Relations, t, t.Add(params.Interval))
		if err != nil {
			err = errors.Wrap(err, "getting pg tables snapshot")
			h.Logger.Println("Error:", err)
			return
		}

		bytes, err := json.Marshal(bucket)
		if err != nil {
			err = errors.Wrap(err, "marshal bucket")
			h.Logger.Println("Error:", err)
			return
		}
		fmt.Println(string(bytes))

		if _, err := w.Write(bytes); err != nil {
			err = errors.Wrap(err, "writing to writer")
			h.Logger.Println("Error:", err)
			return
		}

		if err := w.Close(); err != nil {
			err = errors.Wrap(err, "closing writer")
			h.Logger.Println("Error:", err)
			return
		}
	}
}

func (h *Handler) parseTimeseriesParams(r *http.Request) (TimeseriesParams, error) {
	params := TimeseriesParams{
		Interval: defaultTimeseriesInterval,
	}

	if intervalParam := r.URL.Query().Get("interval"); intervalParam != "" {
		intervalMilliseconds, err := strconv.Atoi(intervalParam)
		if err != nil {
			return params, errors.Wrapf(err, "cannot parse %s", intervalParam)
		}

		// Convert milliseconds to duration, which is in nanoseconds.
		params.Interval = time.Duration(1_000_000 * intervalMilliseconds)
	}

	if relaionsParam := r.URL.Query().Get("relations"); relaionsParam != "" {
		params.Relations = strings.Split(relaionsParam, ",")
	}

	return params, nil
}

func (h *Handler) getPGTablesSnapshot(
	ctx context.Context,
	relations []string,
	start,
	end time.Time,
) (plum.Bucket, error) {
	tableStates, err := h.Store.GetPGTables(ctx, relations)
	if err != nil {
		return plum.Bucket{}, errors.Wrap(err, "getting pg table states from store")
	}

	return plum.Bucket{
		TStart:      start,
		TEnd:        end,
		TableStates: tableStates,
	}, nil
}
