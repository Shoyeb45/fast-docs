package main

import (
	"net/http"
	
	"github.com/Shoyeb45/fast-docs/internal/app"
	"github.com/Shoyeb45/fast-docs/pkg/config"
	"github.com/Shoyeb45/fast-docs/pkg/database"
	"github.com/Shoyeb45/fast-docs/pkg/logger"
)

func main() {
	// read environment variables
	if err := config.LoadEnvironmentVariables(); err != nil {
		panic(err.Error())
	}

	// initialize logger
	if err := logger.Init(); err != nil {
		panic(err.Error())
	}

	logger.Log.Info("Logger initialized successfully.")

	if err := database.Connect(); err != nil {
		panic(err.Error())
	}
	defer database.Close()

	chiMux := app.New()

	if err := http.ListenAndServe(":"+config.Cfg.Port, chiMux); err != nil {
		logger.Log.Error("failed to start application")
		panic(err.Error())
	}

}
