package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/ProjectHivemind/WebGUI/pkg/models"
)

const token_length = 128

var API_URL string = "http://127.0.0.1:4321"

func SetApiUrl(uri, port string) {
	API_URL = "http://" + uri + ":" + port
}

func Authorize(username, password string) string {
	fmt.Println(API_URL)

	hc := http.Client{}

	form := url.Values{}
	form.Set("username", username)
	form.Set("password", password)
	req, err := http.NewRequest("POST", API_URL+"/api/operator/auth", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Content-Length", strconv.Itoa(len(form.Encode())))
	resp, err := hc.Do(req)
	if err != nil {
		return ""
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return ""
	}
	if string(body) == "auth failed" {
		return ""
	} else if string(body) == "true" {
		token := GenerateSecureToken()
		form2 := url.Values{}
		form2.Add("username", username)
		req, err = http.NewRequest("POST", API_URL+"/api/session/"+token, strings.NewReader(form2.Encode()))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Add("Content-Length", strconv.Itoa(len(form2.Encode())))
		resp, err := hc.Do(req)
		if err != nil {
			return ""
		}
		body, err = ioutil.ReadAll(resp.Body)

		if err != nil || string(body) == "there is an error" {
			return ""
		}
		return token
	}

	return ""
}

func GenerateSecureToken() string {
	b := make([]byte, token_length)
	if _, err := rand.Read(b); err != nil {
		return ""
	}

	return hex.EncodeToString(b)
}

func Validate(token string) bool {
	if token != "" {

		hc := http.Client{}

		req, err := http.NewRequest("GET", API_URL+"/api/session/validate/"+token, nil)
		resp, err := hc.Do(req)
		if err != nil {
			return false
		}
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return false
		}

		if string(body) == "true" {
			return true
		}
	}
	return false
}

func getSession(token string) (models.Sessions, error) {
	var session models.Sessions

	hc := http.Client{}

	req, err := http.NewRequest("GET", API_URL+"/api/session/"+token, nil)
	resp, err := hc.Do(req)
	if err != nil {
		return session, err
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return session, err
	}

	err = json.Unmarshal(body, &session)
	if err != nil {
		return session, err
	}

	return session, nil
}

func DeAuthorize(token string) {
	hc := http.Client{}
	req, _ := http.NewRequest("DELETE", API_URL+"/api/session/"+token, nil)
	hc.Do(req)
}
