package http

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi"
	"github.com/sanggonlee/asyncio"
	"github.com/sanggonlee/plum"

	"github.com/gorilla/websocket"
	"github.com/pkg/errors"
)

const (
	wsReadBufSize  = 2048
	wsWriteBufSize = 2048
)

const (
	multipartFormMemoryLimit = 512 << 20 // 512 MB
)

const (
	defaultTimeseriesInterval = 1 * time.Second
)

var letterRunes = []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

// TimeseriesParams specifies the optional parameters for fetching timeseries data.
type TimeseriesParams struct {
	Interval  time.Duration
	Relations []string
	SaveAs    string
}

// StartTimeseriesConnection establishes a websocket connection for sending realtime
// database states in timeseries data
func (h *Handler) StartTimeseriesConnection(w http.ResponseWriter, r *http.Request) {
	params, err := h.parseTimeseriesParams(r)
	if err != nil {
		_ = sendErrorResponse(w, http.StatusBadRequest, err)
		return
	}

	var extraWriters []io.Writer
	var filename string

	if params.SaveAs != "" {
		filename = getTimeseriesDataFilePath(params.SaveAs)
		f, err := os.Create(filename)
		if err != nil {
			err = errors.Wrap(err, "creating jsonl file")
			h.Logger.Println("Error:", err)
			return
		}

		extraWriters = append(extraWriters, f)
	}

	if h.LogTimeseriesData {
		extraWriters = append(extraWriters, h.Logger.Writer())
	}

	if err = h.sendTimeseriesData(w, r, params.Interval, func(cw io.WriteCloser, t time.Time) (io.Writer, []byte, error) {
		wr := asyncio.AsyncMultiWriter(append(extraWriters, cw)...)

		ctx := context.Background()
		bucket, err := h.getPGTablesSnapshot(ctx, params.Relations, t, t.Add(params.Interval))
		if err != nil {
			return wr, nil, errors.Wrap(err, "getting pg tables snapshot")
		}

		bytes, err := json.Marshal(bucket)
		if err != nil {
			return wr, nil, errors.Wrap(err, "marshal bucket")
		}

		return wr, bytes, nil
	}); err != nil {
		h.Logger.Println("Error:", err)
		return
	}

	// params, err := h.parseTimeseriesParams(r)
	// if err != nil {
	// 	_ = sendErrorResponse(w, http.StatusBadRequest, err)
	// 	return
	// }

	// websocketUpgrader := h.getWebsocketUpgrader()

	// conn, err := websocketUpgrader.Upgrade(w, r, nil)
	// if err != nil {
	// 	err = errors.Wrap(err, "instantiating ws connection")
	// 	h.Logger.Println("Error:", err)
	// 	_ = sendErrorResponse(w, http.StatusInternalServerError, err)
	// 	return
	// }
	// defer conn.Close()

	// go func() {
	// 	// Close the connection when it starts failing to read from client
	// 	if _, _, err := conn.ReadMessage(); err != nil {
	// 		conn.Close()
	// 		return
	// 	}
	// }()

	// ticker := time.NewTicker(params.Interval)
	// defer ticker.Stop()

	// var extraWriters []io.Writer
	// var filename string

	// if params.SaveAs != "" {
	// 	filename = getTimeseriesDataFilePath(params.SaveAs)
	// 	f, err := os.Create(filename)
	// 	if err != nil {
	// 		err = errors.Wrap(err, "creating jsonl file")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}

	// 	extraWriters = append(extraWriters, f)
	// }

	// if h.LogTimeseriesData {
	// 	extraWriters = append(extraWriters, h.Logger.Writer())
	// }

	// for t := range ticker.C {
	// 	cw, err := conn.NextWriter(websocket.TextMessage)
	// 	if err != nil {
	// 		if err != websocket.ErrCloseSent {
	// 			err = errors.Wrap(err, "getting next writer")
	// 			h.Logger.Println("Error:", err)
	// 		}
	// 		return
	// 	}

	// 	ctx := context.Background()
	// 	bucket, err := h.getPGTablesSnapshot(ctx, params.Relations, t, t.Add(params.Interval))
	// 	if err != nil {
	// 		err = errors.Wrap(err, "getting pg tables snapshot")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}

	// 	bytes, err := json.Marshal(bucket)
	// 	if err != nil {
	// 		err = errors.Wrap(err, "marshal bucket")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}

	// 	w := asyncio.AsyncMultiWriter(append(extraWriters, cw)...)

	// 	if _, err := w.Write(append(bytes, '\n')); err != nil {
	// 		err = errors.Wrap(err, "writing to writer")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}

	// 	if err := cw.Close(); err != nil {
	// 		err = errors.Wrap(err, "closing writer")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}
	// }
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

	if saveAsParam := r.URL.Query().Get("save_as"); saveAsParam != "" {
		params.SaveAs = saveAsParam
	}

	return params, nil
}

// TimeseriesReplayParams specifies the optional parameters for setting up
// timeseries replay websocket connection.
type TimeseriesReplayParams struct {
	Interval time.Duration
	FileID   string
}

// StartTimeseriesReplayConnection establishes a websocket connection for sending timeseries replay data
func (h *Handler) StartTimeseriesReplayConnection(w http.ResponseWriter, r *http.Request) {
	params, err := h.parseTimeseriesReplayParams(r)
	if err != nil {
		_ = sendErrorResponse(w, http.StatusBadRequest, err)
		return
	}

	filename := getTimeseriesDataFilePath(params.FileID)
	file, err := os.Open(filename)
	if err != nil {
		err = errors.Wrapf(err, "opening file %s", filename)
		h.Logger.Println("Error:", err)
		return
	}
	defer func() {
		if err := os.Remove(filename); err != nil {
			err = errors.Wrapf(err, "deleting file %s", filename)
			h.Logger.Println("Error:", err)
		}
	}()

	dec := json.NewDecoder(file)

	if err = h.sendTimeseriesData(w, r, params.Interval, func(cw io.WriteCloser, t time.Time) (io.Writer, []byte, error) {
		if !dec.More() {
			// Done reading
			return cw, nil, nil
		}

		var m map[string]interface{}
		if err = dec.Decode(&m); err != nil {
			err = errors.Wrap(err, "reading json chunk")
			return cw, nil, err
		}

		bytes, err := json.Marshal(m)
		if err != nil {
			err = errors.Wrap(err, "marshaling a json chunk")
			return cw, bytes, err
		}

		return cw, bytes, nil
	}); err != nil {
		h.Logger.Println("Error:", err)
		return
	}

	// params, err := h.parseTimeseriesReplayParams(r)
	// if err != nil {
	// 	_ = sendErrorResponse(w, http.StatusBadRequest, err)
	// 	return
	// }

	// filename := getTimeseriesDataFilePath(params.FileID)
	// file, err := os.Open(filename)
	// if err != nil {
	// 	err = errors.Wrapf(err, "opening file %s", filename)
	// 	h.Logger.Println("Error:", err)
	// 	return
	// }
	// defer func() {
	// 	h.Logger.Println("Deleting", filename)
	// 	if err := os.Remove(filename); err != nil {
	// 		err = errors.Wrapf(err, "deleting file %s", filename)
	// 		h.Logger.Println("Error:", err)
	// 	}
	// }()

	// dec := json.NewDecoder(file)

	// websocketUpgrader := h.getWebsocketUpgrader()

	// conn, err := websocketUpgrader.Upgrade(w, r, nil)
	// if err != nil {
	// 	err = errors.Wrap(err, "instantiating ws connection")
	// 	h.Logger.Println("Error:", err)
	// 	_ = sendErrorResponse(w, http.StatusInternalServerError, err)
	// 	return
	// }
	// defer conn.Close()

	// go func() {
	// 	// Close the connection when it starts failing to read from client
	// 	if _, _, err := conn.ReadMessage(); err != nil {
	// 		conn.Close()
	// 		return
	// 	}
	// }()

	// ticker := time.NewTicker(params.Interval)
	// defer ticker.Stop()

	// for range ticker.C {
	// 	cw, err := conn.NextWriter(websocket.TextMessage)
	// 	if err != nil {
	// 		if err != websocket.ErrCloseSent {
	// 			err = errors.Wrap(err, "getting next writer")
	// 			h.Logger.Println("Error:", err)
	// 		}
	// 		return
	// 	}

	// 	if !dec.More() {
	// 		// Done reading
	// 		return
	// 	}

	// 	var m map[string]interface{}
	// 	if err = dec.Decode(&m); err != nil {
	// 		err = errors.Wrap(err, "reading json chunk")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}

	// 	bytes, err := json.Marshal(m)
	// 	if err != nil {
	// 		err = errors.Wrap(err, "marshaling a json chunk")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}

	// 	if _, err := cw.Write(bytes); err != nil {
	// 		err = errors.Wrap(err, "writing to writer")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}

	// 	if err := cw.Close(); err != nil {
	// 		err = errors.Wrap(err, "closing writer")
	// 		h.Logger.Println("Error:", err)
	// 		return
	// 	}
	// }
}

func (h *Handler) sendTimeseriesData(
	w http.ResponseWriter,
	r *http.Request,
	interval time.Duration,
	getData func(io.WriteCloser, time.Time) (io.Writer, []byte, error),
) error {
	websocketUpgrader := h.getWebsocketUpgrader()

	conn, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		return errors.Wrap(err, "instantiating ws connection")
	}
	defer conn.Close()

	go func() {
		// Close the connection when it starts failing to read from client
		if _, _, err := conn.ReadMessage(); err != nil {
			conn.Close()
			return
		}
	}()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for t := range ticker.C {
		cw, err := conn.NextWriter(websocket.TextMessage)
		if err != nil {
			if err != websocket.ErrCloseSent {
				return errors.Wrap(err, "getting next writer")
			}
			return nil
		}

		wr, bytes, err := getData(cw, t)
		if err != nil {
			return errors.Wrap(err, "getting data to write")
		}

		if bytes == nil {
			// Done
			return nil
		}

		if _, err := wr.Write(bytes); err != nil {
			return errors.Wrap(err, "writing to writer")
		}

		if err := cw.Close(); err != nil {
			return errors.Wrap(err, "closing websocket connection writer")
		}
	}

	return nil
}

// DownloadTimeseriesDataFileResponse is the response format for DownloadTimeseriesDataFile
type DownloadTimeseriesDataFileResponse struct {
	FileID string `json:"file_id"`
}

// DownloadTimeseriesDataFile responds with the timeseries data file, and deletes it after.
func (h *Handler) DownloadTimeseriesDataFile(w http.ResponseWriter, r *http.Request) {
	fs := http.FileServer(http.Dir("tmp"))
	handler := http.StripPrefix("/timeseries/download/", fs)
	w.Header().Set("Content-Disposition", "attachment")
	handler.ServeHTTP(w, r)

	filename := chi.URLParam(r, urlParamFilename)
	if err := os.Remove(fmt.Sprintf("tmp/%s", filename)); err != nil {
		err = errors.Wrap(err, "deleting timeseries data file")
		h.Logger.Println("Error:", err)
	}
}

// UploadTimeseriesDataFile persists the temporary file.
func (h *Handler) UploadTimeseriesDataFile(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(multipartFormMemoryLimit); err != nil {
		err = errors.Wrap(err, "parsing multipart form")
		h.Logger.Println("Error:", err)
		_ = sendErrorResponse(w, http.StatusInternalServerError, err)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		err = errors.Wrap(err, "reading form file")
		h.Logger.Println("Error:", err)
		_ = sendErrorResponse(w, http.StatusInternalServerError, err)
		return
	}
	defer file.Close()

	fileID := randStringRunes(16)
	filename := getTimeseriesDataFilePath(fileID)
	f, err := os.Create(filename)
	if err != nil {
		err = errors.Wrap(err, "creating temp file")
		h.Logger.Println("Error:", err)
		return
	}

	if _, err = io.Copy(f, file); err != nil {
		err = errors.Wrap(err, "writing to the temp file")
		h.Logger.Println("Error:", err)
		return
	}

	_ = sendResponse(w, http.StatusOK, DownloadTimeseriesDataFileResponse{FileID: fileID})
}

func (h *Handler) parseTimeseriesReplayParams(r *http.Request) (TimeseriesReplayParams, error) {
	params := TimeseriesReplayParams{
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

	if fileIDParam := r.URL.Query().Get("file_id"); fileIDParam != "" {
		params.FileID = fileIDParam
	}

	return params, nil
}

func (h *Handler) getWebsocketUpgrader() websocket.Upgrader {
	return websocket.Upgrader{
		ReadBufferSize:  wsReadBufSize,
		WriteBufferSize: wsWriteBufSize,
		CheckOrigin: func(r *http.Request) bool {
			matched, err := regexp.MatchString(h.AllowedOrigins, r.Header.Get("Origin"))
			if err != nil {
				h.Logger.Println("Error matching the request origin with allowed origins:", err)
				return false
			}

			return matched
		},
	}
}

func (h *Handler) getPGTablesSnapshot(
	ctx context.Context,
	relations []string,
	start,
	end time.Time,
) (plum.Bucket, error) {
	tableStates, err := h.Database.GetPGTables(ctx, relations)
	if err != nil {
		return plum.Bucket{}, errors.Wrap(err, "getting pg table states from store")
	}

	return plum.Bucket{
		TStart:      start,
		TEnd:        end,
		TableStates: tableStates,
	}, nil
}

func getTimeseriesDataFilePath(saveAs string) string {
	return fmt.Sprintf("tmp/%s.jsonl", saveAs)
}

func randStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}
