package routehandler

import (
	"net/http"
	"strings"

	"github.com/ProjectHivemind/WebGUI/pkg/middleware"
	"github.com/gin-gonic/gin"
)

func LoginPage(c *gin.Context) {
	// Check if user is already has a valid session

	// Load Login Page
	c.HTML(http.StatusOK, "login.html", nil)
}

func Login(c *gin.Context) {
	token := middleware.Authorize()
	if token != "" {
		c.Redirect(http.StatusTemporaryRedirect, "/dashboard")
	} else {
		c.HTML(http.StatusUnauthorized, "Unauthorized", nil)
	}
}

func Logout(c *gin.Context) {

}

func LoadPage(c *gin.Context) {
	// parse path in this function
	path := c.Request.URL.Path
	pathArr := strings.Split(path, "/")
	if len(pathArr) == 0 {
		c.JSON(404, gin.H{"code": "PAGE_NOT_FOUND", "message": "Page not found"})
	}

	switch pathArr[0] {
	case "/api":
		FowardAPICall(path)
	case "/dashboard":
		break
	case "/targets":
		// Load Targets Page
		if len(pathArr) == 1 {

		} else { // Load a Specific Target

		}
	case "/actions":
		// Load Actions Page
		if len(pathArr) == 1 {

		} else { // Load a Specific Action

		}
	case "/groups":
		// Load Groups Page
		if len(pathArr) == 1 {

		} else { // Load a Specific group

		}
	case "/profile":
		LoadProfile(path)
	default:
		break
	}

}

func FowardAPICall(path string) {
	// Make request to the internal restapi
}

func LoadProfile(path string) {

}
