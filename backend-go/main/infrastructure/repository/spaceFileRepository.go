package repository

import (
	"context"
	"encoding/csv"
	"errors"
	"io"
	"strconv"
	"treeConverter"

	"goTool/domain"
	"goTool/domain/domainMessage"
	"goTool/infrastructure/entityBdd"
	"strings"
)

type spaceFRepository struct{}

func SpaceFile() domain.SpaceFileRepository {
	return &spaceFRepository{}
}

func (repo *spaceFRepository) Save(ctx context.Context) error {
	return nil
}
func (repo *spaceFRepository) Load(ctx context.Context, sourceFile io.Reader) ([]*domain.Space, error) {
	spaceModels, err := convertCsvToFlatItems(sourceFile)
	if err != nil {
		return nil, err
	}
	spaces := treeConverter.ConvertFlatToTree[entityBdd.SpaceModel, *domain.Space](domain.ROOT_ID, spaceModels)
	return spaces, nil
}

func convertCsvToFlatItems(sourceFile io.Reader) ([]entityBdd.SpaceModel, error) {
	csvReader := csv.NewReader(sourceFile)
	csvReader.Comma = ';'
	csvReader.FieldsPerRecord = 6
	csvReader.ReuseRecord = true

	// Lecture de la 1ere ligne qui définit les noms des colonnes
	firstLine, err := csvReader.Read()
	if errors.Is(err, io.EOF) {
		return nil, domainMessage.Errorf("Le fichier est vide")
	}
	positionByName := convertToPosition(firstLine)
	spaceModels := make([]entityBdd.SpaceModel, 0)
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
		spaceModels = append(spaceModels, convertLineToSpaceModel(positionByName, rec, n))
	}
	return spaceModels, nil
}

func convertLineToSpaceModel(positionByName map[string]int, line []string, lineNumber int) entityBdd.SpaceModel {
	itemModel := new(entityBdd.SpaceModel)
	err := itemModel.SetId(line[positionByName["ID"]])
	if err != nil {
		panic("Fichier incohérent. L'identifiant (" + line[positionByName["ID"]] + ") de l'item (" + line[positionByName["TITLE"]] + ") doit pouvoir être convertit en entier ( ligne:" + strconv.Itoa(lineNumber) + ")")
	}
	itemModel.SetTitle(line[positionByName["TITLE"]])
	itemModel.SetText(line[positionByName["TEXT"]])
	itemModel.SetState(line[positionByName["STATE"]])
	err = itemModel.SetParentId(line[positionByName["PARENTID"]])
	if err != nil {
		panic("Fichier incohérent. L'identifiant du parent (" + line[positionByName["PARENTID"]] + ") de l'item (" + line[positionByName["TITLE"]] + ") doit pouvoir être convertit en entier ( ligne:" + strconv.Itoa(lineNumber) + ")")
	}
	err = itemModel.SetNextId(line[positionByName["NEXTID"]])
	if err != nil {
		panic("Fichier incohérent. L'identifiant du suivant (" + line[positionByName["NEXTID"]] + ") de l'item (" + line[positionByName["TITLE"]] + ") doit pouvoir être convertit en entier ( ligne:" + strconv.Itoa(lineNumber) + ")")
	}
	return *itemModel
}

func convertToPosition(firstLine []string) map[string]int {
	positionByName := make(map[string]int, len(firstLine))
	for index, value := range firstLine {
		positionByName[strings.ToUpper(value)] = index
	}
	return positionByName
}
