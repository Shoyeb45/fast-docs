package app

import (
	"net/http"

	"github.com/Shoyeb45/fast-docs/pkg/config"
	"github.com/Shoyeb45/fast-docs/pkg/logger"
	"github.com/go-chi/chi"
);

func New() {
	r := chi.NewRouter();

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hi"))
	})

	err := http.ListenAndServe(":" + config.Cfg.Port, r);

	if err != nil {
		logger.Log.Error("Failed to start application");
		panic(err.Error());
	}
}