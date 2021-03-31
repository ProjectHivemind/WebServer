package routehandler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/ProjectHivemind/WebGUI/pkg/middleware"
	"github.com/gin-gonic/gin"
)

const API_URL = "http://127.0.0.1:4321"

type ForwardInfo struct {
	method string
	path   string
	form   url.Values
	body   []byte
}

func LoginPage(c *gin.Context) {
	// Check if user is already has a valid session
	token, _ := c.Cookie("token")
	check := middleware.Validate(token)

	if check {
		c.Redirect(http.StatusTemporaryRedirect, "dashboard")
		return
	}
	// Load Login Page
	c.HTML(http.StatusOK, "login.html", nil)
}

func Login(c *gin.Context) {
	username := c.PostForm("username")
	password := c.PostForm("password")
	token := middleware.Authorize(username, password)
	if token != "" {
		// "localhost" has to be updated for the domain / IP address
		c.SetCookie("token", token, 3600, "/", "localhost", false, false)
		c.Redirect(http.StatusTemporaryRedirect, "/dashboard")
	} else {
		// TODO: Needs to give a failed auth message
		c.HTML(http.StatusUnauthorized, "login.html", nil)
	}
}

func Logout(c *gin.Context) {
	token, _ := c.Cookie("token")
	check := middleware.Validate(token)

	if check {
		c.SetCookie("token", "", 0, "/", "localhost", false, false)
		middleware.DeAuthorize(token)
	}
	c.HTML(http.StatusTemporaryRedirect, "login.html", nil)
}

func LoadPage(c *gin.Context) {
	token, _ := c.Cookie("token")
	check := middleware.Validate(token)
	if !check {
		c.Redirect(http.StatusTemporaryRedirect, "/login.html")
	}

	// parse path in this function
	path := c.Request.URL.Path
	pathArr := strings.Split(path, "/")
	if len(pathArr) < 2 {
		c.HTML(http.StatusNotFound, "404.html", nil)
		return
	}

	switch pathArr[1] {
	case "api":
		var forwardInfo ForwardInfo
		forwardInfo.form = url.Values{}
		forwardInfo.path = path
		forwardInfo.method = c.Request.Method

		if len(pathArr) > 2 && forwardInfo.method == "POST" {
			if pathArr[2] == "operator" {
				forwardInfo.form.Set("username", c.Request.FormValue("username"))
				forwardInfo.form.Set("password", c.Request.FormValue("password"))
			} else if pathArr[2] == "session" {
				forwardInfo.form.Set("username", c.Request.FormValue("username"))
			}

			forwardInfo.body, _ = ioutil.ReadAll(c.Request.Body)
		}

		object, err := FowardAPICall(forwardInfo)
		fmt.Print(string(object))
		if err != nil {
			c.JSON(http.StatusBadRequest, nil)
		}

		var jsonConvArr []interface{}
		err = json.Unmarshal(object, &jsonConvArr)
		if err == nil {
			c.JSON(http.StatusOK, jsonConvArr)
			return
		}

		var jsonConv interface{}
		err = json.Unmarshal(object, &jsonConv)
		if err != nil {
			c.JSON(http.StatusBadRequest, nil)
		} else {
			c.JSON(http.StatusOK, jsonConv)
			return
		}

		c.JSON(http.StatusBadRequest, nil)
		return
	case "dashboard.html", "dashboard", "index.html":
		c.HTML(http.StatusOK, "index.html", nil)
		return
	case "targets.html", "targets":
		// Load Targets Page
		if len(pathArr) == 2 {
			c.HTML(http.StatusOK, "targets.html", nil)
			return
		} else { // Load a Specific Target

		}
		break
	case "actions.html", "actions":
		// Load Actions Page
		if len(pathArr) == 2 {
			c.HTML(http.StatusOK, "actions.html", nil)
			return
		} else { // Load a Specific Action

		}
		break
	case "groups.html", "groups":
		// Load Groups Page
		if len(pathArr) == 2 {
			c.HTML(http.StatusOK, "groups.html", nil)
			return
		} else { // Load a Specific group

		}
		break
	case "profile.html", "profile":
		c.HTML(http.StatusOK, "groups.html", nil)
		break
	case "staging.html", "staging":
		c.HTML(http.StatusOK, "staging.html", nil)
	default:
		break
	}

}

func FowardAPICall(forwardInfo ForwardInfo) ([]byte, error) {
	// Make request to the internal restapi
	hc := http.Client{}
	var req *http.Request
	var err error

	if forwardInfo.method != "POST" {
		req, err = http.NewRequest(forwardInfo.method, API_URL+forwardInfo.path, nil)
	} else if len(forwardInfo.form.Get("username")) != 0 {
		req, err = http.NewRequest(forwardInfo.method, API_URL+forwardInfo.path, strings.NewReader(forwardInfo.form.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Add("Content-Length", strconv.Itoa(len(forwardInfo.form.Encode())))
	} else if len(forwardInfo.body) != 0 {
		req, err = http.NewRequest(forwardInfo.method, API_URL+forwardInfo.path, strings.NewReader(string(forwardInfo.body)))
		req.Header.Add("Content-Length", strconv.Itoa(len(string(forwardInfo.body))))
	} else {
		err = fmt.Errorf("request not valid")
	}

	if err != nil {
		return nil, err
	}
	resp, err := hc.Do(req)
	if err != nil {
		return nil, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}
