package models

type Sessions struct {
	SessionToken string `json:"sessiontoken"`
	Username     string `json:"username"`
	ExpTime      string `json:"exptime"`
}
