package mapper

import (
	"goTool/entity"
	"testing"

	"github.com/stretchr/testify/assert"
)

const TITLE1 = "Titre 1";
const TITLE2 = "Titre 2";
const TITLE3 = "Titre 3";
const TITLE4 = "Titre 4";
const TITLE5 = "Titre 5";
const TEXT1 = "Texte 1";
const TEXT2 = "Texte 2";
const TEXT3 = "Texte 3";
const TEXT4 = "Texte 4";
const TEXT5 = "Texte 5";
const RACINE = "Racine";
const TODO="TODO"

func TestConvertItemsModelToItems_shouldBeEmpty_whenNoItems(t *testing.T) {
	// Given
	itemsModel := make([]entity.ItemModel, 0)
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expected := make([]entity.Item, 0)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldBeConvertToItem_whenOneItemModel(t *testing.T) {
	// Given
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 0, true))
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expected := make([]entity.Item, 0)
	expected = append(expected, *entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{}))
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnItems_shouldAllStatusOk_whenNoChildren_whenNextIdsCorrect(t *testing.T) {
	// Given
	itemModel1 := entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 2, false);
	itemModel2 := entity.CreateItemModel(2, TITLE2, TEXT2, TODO, -1, 0, true);
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *itemModel1, *itemModel2)
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expected1 := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{})
	expected2 := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "OK", []entity.Item{})
	expected := make([]entity.Item, 0)
	expected = append(expected, *expected1, *expected2)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnListItems_shouldAllStatusOk_whenOneChildren_whenNextIdsCorrect(t *testing.T) {
	// Given
	itemModel1 := entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 0, true);
	itemModel2 := entity.CreateItemModel(2, TITLE2, TEXT2, TODO, 1, 0, true);
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *itemModel1, *itemModel2)
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expectedChild := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "OK", []entity.Item{})
	expectedParent := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{ *expectedChild })
	expected := make([]entity.Item, 0)
	expected = append(expected, *expectedParent)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnListItems_shouldAllStatusOk_whenTreesWithNextIdsCorrect(t *testing.T) {
	// Given
	parent1 := entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 4, false);
	parent2 := entity.CreateItemModel(4, TITLE4, TEXT4, TODO, -1, 0, true);
	child1parent1 := entity.CreateItemModel(2, TITLE2, TEXT2, TODO, 1, 3, false);
	child2parent1 := entity.CreateItemModel(3, TITLE3, TEXT3, TODO, 1, 0, true);
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *parent1, *parent2, *child1parent1, *child2parent1)
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expectedChild1Item1 := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "OK", []entity.Item{})
	expectedChild2Item1 := entity.CreateReadItem(3, TITLE3, TEXT3, TODO, "OK", []entity.Item{})
	expectedItem1 := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{ *expectedChild1Item1, * expectedChild2Item1})
	expectedItem2 := entity.CreateReadItem(4, TITLE4, TEXT4, TODO, "OK", []entity.Item{})
	expected := make([]entity.Item, 0)
	expected = append(expected, *expectedItem1, *expectedItem2)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnListItems_shouldHaveNextNotFoundStatus_whenTreesWithNextIdsNotFound(t *testing.T) {
	parent1 := entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 4, false);
	parent2 := entity.CreateItemModel(4, TITLE4, TEXT4, TODO, -1, 5, false);
	child1parent1 := entity.CreateItemModel(2, TITLE2, TEXT2, TODO, 1, 3, false);
	child2parent1 := entity.CreateItemModel(3, TITLE3, TEXT3, TODO, 1, 10, false);
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *parent1, *child2parent1, *child1parent1, *parent2);
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expectedChild1Item1 := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "OK", []entity.Item{})
	expectedChild2Item1 := entity.CreateReadItem(3, TITLE3, TEXT3, TODO, "NEXT_NOT_FOUND", []entity.Item{})
	expectedItem1 := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{ *expectedChild1Item1, * expectedChild2Item1})
	expectedItem2 := entity.CreateReadItem(4, TITLE4, TEXT4, TODO, "NEXT_NOT_FOUND", []entity.Item{})
	expected := make([]entity.Item, 0)
	expected = append(expected, *expectedItem1, *expectedItem2)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnListItems_shouldHaveLoopStatus_whenChildrenLoop(t *testing.T) {
	// Given
	parent1 := entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 0, true);
	child1parent1 := entity.CreateItemModel(2, TITLE2, TEXT2, TODO, 1, 3, false);
	child2parent1 := entity.CreateItemModel(3, TITLE3, TEXT3, TODO, 1, 4, false);
	child3Parent1 := entity.CreateItemModel(4, TITLE4, TEXT4, TODO, 1, 2, false);
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *parent1, *child2parent1, *child1parent1, *child3Parent1);
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expectedChild1Item1 := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "OK", []entity.Item{})
	expectedChild2Item1 := entity.CreateReadItem(3, TITLE3, TEXT3, TODO, "OK", []entity.Item{})
	expectedChild3Item1 := entity.CreateReadItem(4, TITLE4, TEXT4, TODO, "LOOP", []entity.Item{})
	expectedItem1 := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{ *expectedChild1Item1, *expectedChild2Item1, *expectedChild3Item1})
	expected := make([]entity.Item, 0)
	expected = append(expected, *expectedItem1)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnListItems_shouldHaveLoopStatus_whenTwoChildrenLoop(t *testing.T) {
	// Given
	parent1 := entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 0, true);
	child1parent1 := entity.CreateItemModel(2, TITLE2, TEXT2, TODO, 1, 2, false);
	child2parent1 := entity.CreateItemModel(3, TITLE3, TEXT3, TODO, 1, 4, false);
	child3Parent1 := entity.CreateItemModel(4, TITLE4, TEXT4, TODO, 1, 3, false);
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *parent1, *child2parent1, *child1parent1, *child3Parent1);
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expectedChild1Item1 := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "LOOP", []entity.Item{})
	expectedChild2Item1 := entity.CreateReadItem(3, TITLE3, TEXT3, TODO, "OK", []entity.Item{})
	expectedChild3Item1 := entity.CreateReadItem(4, TITLE4, TEXT4, TODO, "LOOP", []entity.Item{})
	expectedItem1 := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{ *expectedChild1Item1, *expectedChild2Item1, *expectedChild3Item1})
	expected := make([]entity.Item, 0)
	expected = append(expected, *expectedItem1)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnListItems_shouldHaveOrphanNextNotFoundStatus_whenTreesWithTotalOrphan(t *testing.T) {
	// Given
	parent1 := entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 0, true);
	parent2 := entity.CreateItemModel(4, TITLE4, TEXT4, TODO, -1, 5, false);
	child1parent2 := entity.CreateItemModel(2, TITLE2, TEXT2, TODO, 4, 3, false);
	child2parent2 := entity.CreateItemModel(3, TITLE3, TEXT3, TODO, 4, 10, false);
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel, *parent1, *child2parent2, *child1parent2, *parent2);
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expectedChild1Item2 := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "OK", []entity.Item{})
	expectedChild2Item2 := entity.CreateReadItem(3, TITLE3, TEXT3, TODO, "NEXT_NOT_FOUND", []entity.Item{})
	expectedItem1 := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "ORPHAN", []entity.Item{})
	expectedItem2 := entity.CreateReadItem(4, TITLE4, TEXT4, TODO, "TOTAL_ORPHAN", []entity.Item{ *expectedChild1Item2, * expectedChild2Item2})
	expected := make([]entity.Item, 0)
	expected = append(expected, *expectedItem1, *expectedItem2)
	assert.Equal(t, expected, actual)
}

func TestConvertItemsModelToItems_shouldReturnListItems_shouldAllStatusOk_whenNextIdsCorrect(t *testing.T) {
	itemsModel := make([]entity.ItemModel, 0)
	itemsModel = append(itemsModel,
						*entity.CreateItemModel(1, TITLE1, TEXT1, TODO, -1, 2, false),
						*entity.CreateItemModel(2, TITLE2, TEXT2, TODO, -1, 0, true));
	// When
	actual := ConvertItemsModelToItems(itemsModel)
	// Then
	expectedItem1 := entity.CreateReadItem(1, TITLE1, TEXT1, TODO, "OK", []entity.Item{})
	expectedItem2 := entity.CreateReadItem(2, TITLE2, TEXT2, TODO, "OK", []entity.Item{})
	expected := make([]entity.Item, 0)
	expected = append(expected, *expectedItem1, *expectedItem2)
	assert.Equal(t, expected, actual)
}