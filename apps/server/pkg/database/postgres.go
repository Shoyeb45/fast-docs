package database

import (
	"context"
	"time"
	
	"github.com/Shoyeb45/fast-docs/pkg/config"
	"github.com/Shoyeb45/fast-docs/pkg/logger"
	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func Connect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, config.Cfg.DatabaseURL)
	if err != nil {
		return err
	}
	DB = pool

	logger.Log.Info("Postgresql connected successfully.")

	return nil
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}
