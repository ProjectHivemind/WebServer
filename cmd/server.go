package main

import (
	"net/http"

	"github.com/ProjectHivemind/WebGUI/pkg/routehandler"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.LoadHTMLGlob("../templates/*.html")
	r.Static("/assets", "../templates/assets")

	// CORS set up
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET"},
		AllowHeaders: []string{"Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization", "accept", "origin", "Cache-Control", "X-Requested-With"},
		// AllowCredentials: true,
	}))

	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusTemporaryRedirect, "/dashboard")
	})

	r.GET("/login", routehandler.LoginPage)
	r.GET("/login.html", routehandler.LoginPage)
	r.POST("/login", routehandler.Login)
	r.POST("/login.html", routehandler.Login)

	r.GET("/logout", routehandler.Logout)

	r.NoRoute(routehandler.LoadPage)

	r.Run()
}
