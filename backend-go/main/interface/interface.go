package api

type WebResult interface {
	ConvertToWebResult(entity any) any
}

type Handler struct {
	repos   any
	useCase func()
	convert func()
}
