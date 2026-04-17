/**
 * TEMPLATE ADAPTER: Go / Gin  (src/templates/go/gin.js)
 * Third language — proves the adapter contract is truly language-agnostic.
 * Uses Go's idiomatic package structure: cmd/, internal/{config,database,...}
 */
import { dockerFiles } from '../partials/docker.js';
import { envFiles } from '../partials/env.js';

export async function ginAdapter(config) {
  const files = {
    'go.mod': goMod(config),
    'cmd/server/main.go': mainGo(),
    'internal/config/config.go': configGo(),
    'internal/database/database.go': databaseGo(config.db),
    'internal/routes/routes.go': routesGo(),
    'internal/handlers/item.go': itemHandler(),
    'internal/services/item.go': itemService(),
    'internal/models/item.go': itemModel(config.db),
    'internal/middleware/error.go': errorMiddleware(),
    'internal/middleware/logger.go': loggerMiddleware(),
    'internal/utils/response.go': responseUtil(),
    'README.md': readme(),
    ...envFiles(config),
    ...(config.docker ? dockerFiles('go', 'gin') : {}),
  };

  return {
    files,
    installCommand: 'go mod tidy',
    defaultPort: 8080,
    vars: {},
  };
}

function goMod(config) {
  const dbRequire =
    {
      mongodb: 'go.mongodb.org/mongo-driver v1.13.0',
      postgresql: 'github.com/lib/pq v1.10.9\n\tgithub.com/jmoiron/sqlx v1.3.5',
      sqlite: 'github.com/mattn/go-sqlite3 v1.14.18\n\tgithub.com/jmoiron/sqlx v1.3.5',
    }[config.db] || '';

  return `module <%= projectName %>

go 1.21

require (
\tgithub.com/gin-gonic/gin v1.9.1
\tgithub.com/joho/godotenv v1.5.1
\t${dbRequire}
)
`;
}

function mainGo() {
  return `package main

import (
\t"log"
\t"<%= projectName %>/internal/config"
\t"<%= projectName %>/internal/database"
\t"<%= projectName %>/internal/routes"
)

func main() {
\tcfg := config.Load()

\tdb, err := database.Connect(cfg)
\tif err != nil {
\t\tlog.Fatalf("database connection failed: %v", err)
\t}
\tdefer database.Close(db)

\tr := routes.Setup(db)

\tlog.Printf("[<%= projectName %>] Server starting on :%s", cfg.Port)
\tif err := r.Run(":" + cfg.Port); err != nil {
\t\tlog.Fatalf("server error: %v", err)
\t}
}
`;
}

function configGo() {
  return `package config

import (
\t"log"
\t"os"
\t"github.com/joho/godotenv"
)

type Config struct {
\tPort        string
\tDatabaseURL string
\tJWTSecret   string
\tDebug       bool
}

func Load() *Config {
\tif err := godotenv.Load(); err != nil {
\t\tlog.Println("No .env file found — using environment variables")
\t}
\treturn &Config{
\t\tPort:        getEnv("PORT", "8080"),
\t\tDatabaseURL: getEnv("DATABASE_URL", ""),
\t\tJWTSecret:   getEnv("JWT_SECRET", "change-me-in-production"),
\t\tDebug:       os.Getenv("DEBUG") == "true",
\t}
}

func getEnv(key, fallback string) string {
\tif v := os.Getenv(key); v != "" {
\t\treturn v
\t}
\treturn fallback
}
`;
}

function databaseGo(db) {
  if (db === 'mongodb') {
    return `package database

import (
\t"context"
\t"time"
\t"<%= projectName %>/internal/config"
\t"go.mongodb.org/mongo-driver/mongo"
\t"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect(cfg *config.Config) (*mongo.Client, error) {
\tctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
\tdefer cancel()
\tclient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.DatabaseURL))
\tif err != nil {
\t\treturn nil, err
\t}
\tif err := client.Ping(ctx, nil); err != nil {
\t\treturn nil, err
\t}
\treturn client, nil
}

func Close(client *mongo.Client) {
\tctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
\tdefer cancel()
\t_ = client.Disconnect(ctx)
}
`;
  }
  const driver = db === 'postgresql' ? 'postgres' : 'sqlite3';
  const libImport =
    db === 'postgresql' ? '_ "github.com/lib/pq"' : '_ "github.com/mattn/go-sqlite3"';
  return `package database

import (
\t${libImport}
\t"<%= projectName %>/internal/config"
\t"github.com/jmoiron/sqlx"
)

func Connect(cfg *config.Config) (*sqlx.DB, error) {
\tdb, err := sqlx.Connect("${driver}", cfg.DatabaseURL)
\tif err != nil {
\t\treturn nil, err
\t}
\tdb.SetMaxOpenConns(25)
\tdb.SetMaxIdleConns(5)
\treturn db, nil
}

func Close(db *sqlx.DB) { _ = db.Close() }
`;
}

function routesGo() {
  return `package routes

import (
\t"github.com/gin-gonic/gin"
\t"<%= projectName %>/internal/handlers"
\t"<%= projectName %>/internal/middleware"
)

func Setup(db interface{}) *gin.Engine {
\tr := gin.New()
\tr.Use(gin.Recovery())
\tr.Use(middleware.Logger())
\tr.Use(middleware.ErrorHandler())

\tr.GET("/health", func(c *gin.Context) {
\t\tc.JSON(200, gin.H{"status": "ok"})
\t})

\th  := handlers.NewItemHandler(db)
\tv1 := r.Group("/api/v1")
\t{
\t\titems := v1.Group("/items")
\t\titems.GET("",       h.List)
\t\titems.GET("/:id",   h.Get)
\t\titems.POST("",      h.Create)
\t\titems.PUT("/:id",   h.Update)
\t\titems.DELETE("/:id",h.Delete)
\t}

\treturn r
}
`;
}

function itemHandler() {
  return `package handlers

import (
\t"net/http"
\t"github.com/gin-gonic/gin"
\t"<%= projectName %>/internal/services"
\t"<%= projectName %>/internal/utils"
)

type ItemHandler struct{ svc *services.ItemService }

func NewItemHandler(db interface{}) *ItemHandler {
\treturn &ItemHandler{svc: services.NewItemService(db)}
}

func (h *ItemHandler) List(c *gin.Context) {
\titems, err := h.svc.FindAll()
\tif err != nil { _ = c.Error(err); return }
\tutils.Success(c, items)
}

func (h *ItemHandler) Get(c *gin.Context) {
\titem, err := h.svc.FindByID(c.Param("id"))
\tif err != nil { c.JSON(http.StatusNotFound, gin.H{"error": "not found"}); return }
\tutils.Success(c, item)
}

func (h *ItemHandler) Create(c *gin.Context) {
\tvar body map[string]interface{}
\tif err := c.ShouldBindJSON(&body); err != nil {
\t\tc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
\t\treturn
\t}
\titem, err := h.svc.Create(body)
\tif err != nil { _ = c.Error(err); return }
\tc.JSON(http.StatusCreated, gin.H{"success": true, "data": item})
}

func (h *ItemHandler) Update(c *gin.Context) {
\tvar body map[string]interface{}
\tif err := c.ShouldBindJSON(&body); err != nil {
\t\tc.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
\t\treturn
\t}
\titem, err := h.svc.Update(c.Param("id"), body)
\tif err != nil { c.JSON(http.StatusNotFound, gin.H{"error": "not found"}); return }
\tutils.Success(c, item)
}

func (h *ItemHandler) Delete(c *gin.Context) {
\tif err := h.svc.Delete(c.Param("id")); err != nil {
\t\tc.JSON(http.StatusNotFound, gin.H{"error": "not found"})
\t\treturn
\t}
\tc.Status(http.StatusNoContent)
}
`;
}

function itemService() {
  return `// Package services — all business logic.
// No gin/HTTP context — clean separation from handler layer.
package services

import "<%= projectName %>/internal/models"

type ItemService struct{ db interface{} }

func NewItemService(db interface{}) *ItemService { return &ItemService{db: db} }

func (s *ItemService) FindAll() ([]models.Item, error)                             { return models.FindAll(s.db) }
func (s *ItemService) FindByID(id string) (*models.Item, error)                    { return models.FindByID(s.db, id) }
func (s *ItemService) Create(data map[string]interface{}) (*models.Item, error)    { return models.Create(s.db, data) }
func (s *ItemService) Update(id string, data map[string]interface{}) (*models.Item, error) { return models.Update(s.db, id, data) }
func (s *ItemService) Delete(id string) error                                       { return models.Delete(s.db, id) }
`;
}

function itemModel(_db) {
  return `package models

import "time"

// Item is the core domain model.
// Implement the stub functions below with your DB driver of choice (<%= db %>).
type Item struct {
\tID          string    \`json:"id"          db:"id"\`
\tName        string    \`json:"name"        db:"name"\`
\tDescription string    \`json:"description" db:"description"\`
\tCreatedAt   time.Time \`json:"created_at"  db:"created_at"\`
}

// TODO: replace stubs with <%= db %>-specific implementations.
func FindAll(db interface{}) ([]Item, error)                            { return []Item{}, nil }
func FindByID(db interface{}, id string) (*Item, error)                 { return nil, nil }
func Create(db interface{}, data map[string]interface{}) (*Item, error) { return &Item{}, nil }
func Update(db interface{}, id string, data map[string]interface{}) (*Item, error) { return &Item{}, nil }
func Delete(db interface{}, id string) error                            { return nil }
`;
}

function errorMiddleware() {
  return `package middleware

import (
\t"log"
\t"net/http"
\t"github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
\treturn func(c *gin.Context) {
\t\tc.Next()
\t\tif len(c.Errors) > 0 {
\t\t\terr := c.Errors.Last()
\t\t\tlog.Printf("[ERROR] %v", err)
\t\t\tc.JSON(http.StatusInternalServerError, gin.H{
\t\t\t\t"success": false,
\t\t\t\t"error":   gin.H{"message": err.Error()},
\t\t\t})
\t\t}
\t}
}
`;
}

function loggerMiddleware() {
  return `package middleware

import (
\t"fmt"
\t"time"
\t"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
\treturn func(c *gin.Context) {
\t\tstart  := time.Now()
\t\tc.Next()
\t\tfmt.Printf("[GIN] %s | %3d | %13v | %s %s\n",
\t\t\ttime.Now().Format(time.RFC3339),
\t\t\tc.Writer.Status(),
\t\t\ttime.Since(start),
\t\t\tc.Request.Method,
\t\t\tc.Request.URL.Path,
\t\t)
\t}
}
`;
}

function responseUtil() {
  return `package utils

import (
\t"net/http"
\t"github.com/gin-gonic/gin"
)

func Success(c *gin.Context, data interface{}) {
\tc.JSON(http.StatusOK, gin.H{"success": true, "data": data})
}
`;
}

function readme() {
  return `# <%= projectName %>

> Scaffolded by **crud-scaffold** — Go / Gin / <%= db %>

## Quick Start
\`\`\`bash
cp .env.example .env
go run cmd/server/main.go
\`\`\`

## Structure
\`\`\`
cmd/server/      Entry point
internal/
  config/        Configuration
  database/      DB connection (<%= db %>)
  handlers/      HTTP boundary
  services/      Business logic
  models/        Data layer
  middleware/    Error handler, logger
  utils/         Shared helpers
\`\`\`
`;
}
