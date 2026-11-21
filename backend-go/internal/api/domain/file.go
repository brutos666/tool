package domain

type FileReader interface {
	Read(p []byte) (n int, err error)
	FileName() string
}
