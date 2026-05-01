package errormiddleware

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/Shoyeb45/fast-docs/pkg/apierr"
	"github.com/Shoyeb45/fast-docs/pkg/logger"
)

type errorResponse struct {
	Code    apierr.ErrorCode    `json:"code"`
	Message string              `json:"message"`
	Details []apierr.FieldError `json:"details,omitempty"`
}

func WriteError(w http.ResponseWriter, r *http.Request, err error) {
	*r = *r.WithContext(withError(r.Context(), err))
}

func ErrorHandler() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			next.ServeHTTP(w, r)

			err := errorFromCtx(r.Context())
			if err == nil {
				return
			}

			var apiErr *apierr.APIError

			switch {
			case apierr.As(err, &apiErr):
				logAPIError(r, apiErr)
				writeJson(w, apiErr.StatusCode, errorResponse{
					Code:    apiErr.Code,
					Message: apiErr.Message,
					Details: apiErr.Details,
				})
			default:
				logger.Log.Error("unhandled error",
					slog.String("methid", r.Method),
					slog.String("path", r.URL.Path),
					slog.String("remote_addr", r.RemoteAddr),
					slog.Any("error", err),
				)
				writeJson(w, http.StatusInternalServerError, errorResponse{
					Code:    apierr.CodeInternal,
					Message: "an unexpected error occurred",
				})
			}
		})
	}
}

func logAPIError(r *http.Request, err *apierr.APIError) {
	attrs := []any{
		slog.String("method", r.Method),
		slog.String("path", r.URL.Path),
		slog.String("remote_addr", r.RemoteAddr),
		slog.String("error_code", string(err.Code)),
		slog.String("error_message", err.Message),
	}

	if cause := err.Cause(); cause != nil {
		attrs = append(attrs, slog.Any("cause", cause))
	}

	switch {
	case err.StatusCode >= 500:
		logger.Log.Error("server error", attrs...)
	case err.StatusCode == http.StatusUnauthorized || err.StatusCode == http.StatusNotFound:
		logger.Log.Info("client error", attrs...)
	default:
		logger.Log.Warn("client error", attrs...)
	}
}

func writeJson(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
