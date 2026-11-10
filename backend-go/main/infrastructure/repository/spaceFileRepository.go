package repository

import (
	"bytes"
	"context"
	"encoding/csv"
	"errors"
	"io"
	"strconv"
	"treeConverter"

	"goTool/domain"
	"goTool/domain/domainMessage"
	"strings"
)

const CSV_SEPARATOR = ';'

type spaceFRepository struct{}

func SpaceFile() domain.SpaceFileRepository {
	return &spaceFRepository{}
}

func (repo *spaceFRepository) Load(ctx context.Context, sourceFile io.Reader) ([]*domain.Space, error) {
	flatItems, err := convertCsvToFlatItems(sourceFile)
	if err != nil {
		return nil, err
	}
	spaces := treeConverter.ConvertFlatToTree[FlatItem, *domain.Space](domain.ROOT_ID, flatItems)
	return spaces, nil
}
func (repo *spaceFRepository) Write(ctx context.Context, nodeSpace domain.NodeSpace) (*bytes.Buffer, error) {
	var buf bytes.Buffer
	// BOM UTF-8 : Excel reconnaît ainsi l'encodage (accents)
	_, err := buf.Write([]byte{0xEF, 0xBB, 0xBF})
	if err != nil {
		return nil, err
	}

	csvWriter := csv.NewWriter(&buf)
	csvWriter.Comma = CSV_SEPARATOR

	// Entête de colonnes
	err = csvWriter.Write([]string{"ID", "NEXTID", "PARENTID", "STATE", "TEXT", "TITLE"})
	if err != nil {
		return nil, err
	}
	parentPath := []string{"-1"}
	err = writeSpace(csvWriter, *nodeSpace.GetSpace(), parentPath, 0, true)
	if err != nil {
		return nil, err
	}
	csvWriter.Flush() // vide le tampon vers le client
	err = csvWriter.Error()
	if err != nil {
		return nil, err
	}
	return &buf, nil
}

func convertCsvToFlatItems(sourceFile io.Reader) ([]FlatItem, error) {
	csvReader := csv.NewReader(sourceFile)
	csvReader.Comma = CSV_SEPARATOR
	csvReader.FieldsPerRecord = 6
	csvReader.ReuseRecord = true

	// Lecture de la 1ere ligne qui définit les noms des colonnes
	firstLine, err := csvReader.Read()
	if errors.Is(err, io.EOF) {
		return nil, domainMessage.Errorf("Le fichier est vide")
	}
	positionByName := convertToPosition(firstLine)
	flatItems := make([]FlatItem, 0)
	n := 0
	for {
		rec, err := csvReader.Read()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return nil, err
		}
		n++
		flatItems = append(flatItems, convertLineToSpaceModel(positionByName, rec, n))
	}
	return flatItems, nil
}

func convertLineToSpaceModel(positionByName map[string]int, line []string, lineNumber int) FlatItem {
	flatItem := new(FlatItem)
	flatItem.SetId(line[positionByName["ID"]])
	flatItem.SetTitle(line[positionByName["TITLE"]])
	flatItem.SetText(line[positionByName["TEXT"]])
	flatItem.SetState(line[positionByName["STATE"]])
	flatItem.SetParentId(line[positionByName["PARENTID"]])
	flatItem.SetNextId(line[positionByName["NEXTID"]])
	return *flatItem
}

func convertToPosition(firstLine []string) map[string]int {
	positionByName := make(map[string]int, len(firstLine))
	for index, value := range firstLine {
		positionByName[strings.ToUpper(value)] = index
	}
	return positionByName
}

func writeSpace(csvWriter *csv.Writer, space domain.Space, parentPath []string, index int, noNext bool) error {
	var path []string
	// Ne pas exporter le noeud racine
	if space.GetId() == domain.ROOT_ID {
		path = parentPath
	} else {
		path = append(parentPath, strconv.Itoa(index))
		err := csvWriter.Write(getCsvLine(space, parentPath, index, noNext))
		if err != nil {
			return err
		}
	}
	spaces := space.GetChildrenSpaces().GetList()
	lastIndex := len(spaces) - 1
	for childIndex, childSpace := range spaces {
		err := writeSpace(csvWriter, *childSpace, path, childIndex, lastIndex == childIndex)
		if err != nil {
			return err
		}
	}
	return nil
}

func getCsvLine(space domain.Space, parentPath []string, index int, noNext bool) []string {
	// NOTE : Choix différent du Java. Ici l'identifiant représente le chemin
	idPath := append(parentPath, strconv.Itoa(index))
	nextIdPath := []string{}
	if !noNext {
		nextIdPath = append(parentPath, strconv.Itoa(index+1))
	}
	// "ID";"NEXTID";"PARENTID";"STATE";"TEXT";"TITLE"
	return []string{pipeJoin(idPath), pipeJoin(nextIdPath), pipeJoin(parentPath), space.GetState(), space.GetText(), space.GetTitle()}
}
func pipeJoin(path []string) string {
	return strings.Join(path, "|")
}
