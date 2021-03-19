package middleware

import (
	"crypto/rand"
	"encoding/hex"
)

const token_length = 128

func Authorize(username, password string) string {
	// TODO: Link with actual database
	if username == "admin" && password == "admin" {
		return GenerateSecureToken()
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
	// TODO: Check database for proper validation
	if token != "" {
		return true
	} else {
		return false
	}
}

func DeAuthorize() {
	// TODO: Remove the token from the database
}
