package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"goTool/interface/http/handler/authentication"
	"goTool/interface/webResult"
)

const (
	VALID_TOKEN   = "token valide"
	INVALID_TOKEN = "token invalide"
	REQUEST_PATH  = "/api/hello"
)

type requestBuilder struct {
	method, path, token string
	requestParam        webResult.JsonParameter
}

func (s requestBuilder) WithParam(requestParam string) requestBuilder {
	s.requestParam = webResult.JsonParameter{Value: requestParam}
	return s
}

func (s requestBuilder) WithGetMethod() requestBuilder {
	s.method = http.MethodGet
	return s
}

func (s requestBuilder) WithPostMethod() requestBuilder {
	s.method = http.MethodPost
	return s
}

func (s requestBuilder) WithValidToken() requestBuilder {
	s.token = VALID_TOKEN
	return s
}

func (s requestBuilder) WithInvalidToken() requestBuilder {
	s.token = INVALID_TOKEN
	return s
}

func (s requestBuilder) WithPath(path string) requestBuilder {
	s.path = path
	return s
}

func (s requestBuilder) build() *http.Request {
	var request *http.Request
	path := s.path
	if path == "" {
		path = REQUEST_PATH
	}
	method := s.method
	if method == "" {
		method = http.MethodGet
	}
	token := s.token
	if token == "" {
		token = VALID_TOKEN
	}
	if s.requestParam.Value != "" {
		jsonData, err := json.Marshal(s.requestParam)
		if err != nil {
			panic("Paramètre mal défini :" + err.Error())
		}
		request = httptest.NewRequest(method, path, bytes.NewReader(jsonData))
	} else {
		request = httptest.NewRequest(method, path, http.NoBody)
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set(authentication.AUTH_HEADER, authentication.AUTH_TOKEN_PREFIX+token)
	return request
}
