package handler

import (
	"encoding/json"
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"strings"

	"goTool/internal/api/domain/domainMessage"
	"goTool/internal/api/interface/mapper"
)

func getJsonParameter[P any](requestMapper mapper.RequestMapper, request *http.Request) (*P, error) {
	webParameter := requestMapper.GetWebResultInstance()
	err := json.NewDecoder(request.Body).Decode(&webParameter)
	if err != nil {
		return nil, err
	}
	if validationErr := validate.Struct(webParameter); validationErr != nil {
		return nil, validationErr
	}
	domainParameter, ok := requestMapper.ConvertToDomain(webParameter).(*P)
	if !ok {
		panic(PARAM_CONVERT_PANIC)
	}
	return domainParameter, nil
}

func getFileParameter(request *http.Request) (io.Reader, error) {
	if !strings.HasPrefix(request.Header.Get("Content-Type"), "multipart/form-data") {
		return nil, domainMessage.NewError(INVALID_FILE)
	}
	reader, err := request.MultipartReader()
	if err != nil {
		return nil, domainMessage.NewError(INVALID_FILE)
	}
	return getFileReader(reader)
}

func getFileReader(reader *multipart.Reader) (io.Reader, error) {
	for {
		part, err := reader.NextPart()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			if isTooBigError(err) {
				return nil, domainMessage.NewError(FILE_TOO_BIG)
			}
			return nil, domainMessage.NewError(INVALID_FILE)
		}
		if part.FormName() != FORM_FILE_NAME || part.FileName() == "" {
			continue // pas le fichier attendu
		}
		return part, nil
	}
	return nil, domainMessage.NewError(BAD_FILE)
}

func isTooBigError(err error) bool {
	var mbe *http.MaxBytesError
	return errors.As(err, &mbe)
}
