package config

import (
	"errors"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	// Stage or environemnt of the application. dev or prod
	Stage                   string
	DatabaseUrl             string
	Port                    string
	GithubClientId          string
	GithubClientSecret      string
	// Frontend application url
	OriginUrl               string
	GithubRedirectUrl       string
	JwtPrivateKey           string
	JwtPublicKey            string
	TokenIssuer             string
	TokenAudience           string
	AccessTokenValiditySec  string
	RefreshTokenValiditySec string
	// Directory where logging should happen
	LogDirectory            string
}

var Cfg *Config

func LoadEnvironmentVariables() error {
	godotenv.Load(".env")

	Cfg = &Config{
		DatabaseUrl:             getEnv("DATABASE_URL", ""),
		Port:                    getEnv("PORT", "8080"),
		GithubClientId:          getEnv("GITHUB_CLIENT_ID", ""),
		GithubClientSecret:      getEnv("GITHUB_CLIENT_SECRET", ""),
		OriginUrl:               getEnv("ORIGIN_URL", "http://localhost:3000"),
		GithubRedirectUrl:       getEnv("GIHUB_REDIRECT_URL", "https://github.com/login/oauth/authorize"),
		JwtPrivateKey:           getEnv("JWT_PRIVATE_KEY", ""),
		JwtPublicKey:            getEnv("JWT_PUBLIC_KEY", ""),
		TokenIssuer:             getEnv("TOKEN_ISSUER", ""),
		TokenAudience:           getEnv("TOKEN_AUDIENCE", ""),
		AccessTokenValiditySec:  getEnv("ACCESS_TOKEN_VALIDITY_SEC", "3600"),
		RefreshTokenValiditySec: getEnv("REFRESH_TOKEN_VALIDITY_SEC", "864000"),
		Stage:                   getEnv("STAGE", "dev"),
		LogDirectory: 			 getEnv("LOG_DIRECTORY", "logs"),
	}

	return validateEnvironmentVariables()
}

func validateEnvironmentVariables() error {
	var err error = nil

	if err = validatePort(); err != nil {
		return err
	}

	if err = validateDatabaseUrl(); err != nil {
		return err
	}

	if Cfg.GithubClientId == "" {
		return errors.New("Github Client ID should not be empty.")
	}

	if Cfg.GithubClientSecret == "" {
		return errors.New("Github Client Secret should not be empty.")
	}

	if Cfg.OriginUrl == "" || (!strings.HasPrefix(Cfg.OriginUrl, "http://") && !strings.HasPrefix(Cfg.OriginUrl, "https://")) {
		return errors.New("Origin URL must be a given for CORS and it must start with http:// or https://")
	}

	if Cfg.GithubRedirectUrl == "" {
		return errors.New("Github Redirect URL must be provided")
	}

	if Cfg.JwtPrivateKey == "" || Cfg.JwtPublicKey == "" {
		return errors.New("JWT Keys must be provided for secure authentication.")
	}

	if Cfg.Stage == "" || (Cfg.Stage != "dev" && Cfg.Stage != "prod") {
		return errors.New("STAGE must be either dev or prod.")
	}

	return err
}

func validateDatabaseUrl() error {
	dbUrl := Cfg.DatabaseUrl

	if dbUrl == "" {
		return errors.New("Database url cannot be empty.")
	}

	if !strings.HasPrefix(dbUrl, "postgresql://") && !strings.HasPrefix(dbUrl, "potgres://") {
		return errors.New("You must provide postgres database url which starts with postgresql:// or postgres://")
	}
	return nil
}

func validatePort() error {
	port, err := strconv.Atoi(Cfg.Port)

	if err != nil {
		return errors.New("PORT must be a number, PORT: " + Cfg.Port)
	}
	if port < 0 || port > 65535 {
		return errors.New("PORT out of valid range, expected between min : 1, max: 65535, got " + Cfg.Port)
	}
	return nil
}

func getEnv(key string, defaultVal string) string {
	val, ok := os.LookupEnv(key)

	if ok {
		return val
	}
	if val == "" {
		return defaultVal
	}

	return defaultVal
}
