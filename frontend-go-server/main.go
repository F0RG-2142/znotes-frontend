// main.go
package main

import (
    "embed"
    "io/fs"
    "log"
    "net/http"
    "net/http/httputil"
    "net/url"
    "os"
)

//go:embed dist
var dist embed.FS

func main() {
    frontendPort := getEnv("FRONTEND_PORT", "5173")
    backendURL := getEnv("BACKEND_URL", "http://localhost:8080")

    // Parse backend URL
    backend, err := url.Parse(backendURL)
    if err != nil {
        log.Fatalf("Invalid BACKEND_URL: %v", err)
    }
    proxy := httputil.NewSingleHostReverseProxy(backend)

    distFS, err := fs.Sub(dist, "dist")
	if err != nil {
    	log.Fatalf("Failed to open embedded dist: %v", err)
	}
	fileServer := http.FileServer(http.FS(distFS))

	mux := http.NewServeMux()

    // proxy /api to backend
    mux.Handle("/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("API Proxy: %s %s", r.Method, r.URL.Path)
        proxy.ServeHTTP(w, r)
    }))

    // serve static assets
    mux.Handle("/assets/", fileServer)
    mux.Handle("/favicon.ico", fileServer)
    mux.Handle("/robots.txt", fileServer)
    mux.Handle("/manifest.json", fileServer)

    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fileServer.ServeHTTP(w, r)
		return
	})

    // Start server
    addr := ":" + frontendPort
    log.Printf("Frontend server starting on http://localhost%s", addr)
    log.Printf("Proxying /api to %s", backendURL)
    log.Fatal(http.ListenAndServe(addr, mux))
}

func getEnv(key, fallback string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return fallback
}