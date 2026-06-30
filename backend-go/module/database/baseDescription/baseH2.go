package baseDescription

import (
	_ "github.com/jmrobles/h2go"
)

type H2Base struct {
}

func (base H2Base) GetDriverName() string {	return "h2" }
func (base H2Base) GetDataSourceName() string {
	return "h2://sa@localhost:9092//home/eowyn/projects/tool/backend-tool/database/task-tool-db"
}