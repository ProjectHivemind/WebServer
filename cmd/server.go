package main

import (
	"net/http"

	"github.com/ProjectHivemind/WebGUI/pkg/routehandler"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.LoadHTMLGlob("../templates/*.html")
	r.Static("/assets", "../templates/assets")

	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusTemporaryRedirect, "/dashboard")
	})

	r.GET("/login", routehandler.LoginPage)
	r.POST("/login", routehandler.Login)

	r.NoRoute(routehandler.LoadPage)

	r.Run()
}
