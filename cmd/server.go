package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/ProjectHivemind/WebGUI/pkg/conf"
	"github.com/ProjectHivemind/WebGUI/pkg/middleware"
	"github.com/ProjectHivemind/WebGUI/pkg/routehandler"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Println("missing argument: need path to config file")
		os.Exit(1)
	}
	configFilePath := os.Args[1]

	// Reads the config file
	var configOptions conf.ConfOptions
	configOptions.GetConf(configFilePath)

	// Set the all of the variables based on the config
	routehandler.SetApiUrl(
		configOptions.Restapi["uri"],
		configOptions.Restapi["port"],
	)
	routehandler.SetDomain(configOptions.Webserver["uri"])

	middleware.SetApiUrl(
		configOptions.Restapi["uri"],
		configOptions.Restapi["port"],
	)

	// Set up gin
	gin.SetMode(gin.ReleaseMode) // Change this to enabled debugging
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

	r.Run("0.0.0.0:" + configOptions.Webserver["port"])
}
