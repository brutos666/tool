package treeConverter

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

const (
	TITLE1 = "Titre 1"
	TITLE2 = "Titre 2"
	TITLE3 = "Titre 3"
	TITLE4 = "Titre 4"
	TITLE5 = "Titre 5"
)

func TestConvertFlatToTree_shouldBeEmpty_whenNoItems(t *testing.T) {
	// Given
	itemsFlat := []ItemFlatBdd{}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expected := make([]*ItemTreeEntity, 0)
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldBeConvertToItem_whenOneItemModel(t *testing.T) {
	// Given
	itemsFlat := []ItemFlatBdd{*CreateItemFlatBdd(1, -1, 0, true, TITLE1)}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expected := []*ItemTreeEntity{CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{})}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnItems_shouldAllStatusOk_whenNoChildren_whenNextIdsCorrect(t *testing.T) {
	// Given
	itemFlatBdd1 := *CreateItemFlatBdd(1, -1, 2, false, TITLE1)
	itemFlatBdd2 := *CreateItemFlatBdd(2, -1, 0, true, TITLE2)
	itemsFlat := []ItemFlatBdd{itemFlatBdd1, itemFlatBdd2}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expected1 := CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{})
	expected2 := CreateItemTreeEntity(2, OK, TITLE2, []*ItemTreeEntity{})
	expected := []*ItemTreeEntity{expected1, expected2}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnListItems_shouldAllStatusOk_whenOneChildren_whenNextIdsCorrect(t *testing.T) {
	// Given
	itemFlatBdd1 := *CreateItemFlatBdd(1, -1, 0, true, TITLE1)
	itemFlatBdd2 := *CreateItemFlatBdd(2, 1, 0, true, TITLE2)
	itemsFlat := []ItemFlatBdd{itemFlatBdd1, itemFlatBdd2}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expectedChild := CreateItemTreeEntity(2, OK, TITLE2, []*ItemTreeEntity{})
	expectedParent := CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{expectedChild})
	expected := []*ItemTreeEntity{expectedParent}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnListItems_shouldAllStatusOk_whenTreesWithNextIdsCorrect(t *testing.T) {
	// Given
	parent1 := *CreateItemFlatBdd(1, -1, 4, false, TITLE1)
	parent2 := *CreateItemFlatBdd(4, -1, 0, true, TITLE4)
	child1parent1 := *CreateItemFlatBdd(2, 1, 3, false, TITLE2)
	child2parent1 := *CreateItemFlatBdd(3, 1, 0, true, TITLE3)
	itemsFlat := []ItemFlatBdd{parent1, parent2, child1parent1, child2parent1}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expectedChild1Item1 := CreateItemTreeEntity(2, OK, TITLE2, []*ItemTreeEntity{})
	expectedChild2Item1 := CreateItemTreeEntity(3, OK, TITLE3, []*ItemTreeEntity{})
	expectedItem1 := CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{expectedChild1Item1, expectedChild2Item1})
	expectedItem2 := CreateItemTreeEntity(4, OK, TITLE4, []*ItemTreeEntity{})
	expected := []*ItemTreeEntity{expectedItem1, expectedItem2}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnListItems_shouldHaveNextNotFoundStatus_whenTreesWithNextIdsNotFound(t *testing.T) {
	parent1 := *CreateItemFlatBdd(1, -1, 4, false, TITLE1)
	parent2 := *CreateItemFlatBdd(4, -1, 5, false, TITLE4)
	child1parent1 := *CreateItemFlatBdd(2, 1, 3, false, TITLE2)
	child2parent1 := *CreateItemFlatBdd(3, 1, 10, false, TITLE3)
	itemsFlat := []ItemFlatBdd{parent1, child2parent1, child1parent1, parent2}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expectedChild1Item1 := CreateItemTreeEntity(2, OK, TITLE2, []*ItemTreeEntity{})
	expectedChild2Item1 := CreateItemTreeEntity(3, NEXT_NOT_FOUND, TITLE3, []*ItemTreeEntity{})
	expectedItem1 := CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{expectedChild1Item1, expectedChild2Item1})
	expectedItem2 := CreateItemTreeEntity(4, NEXT_NOT_FOUND, TITLE4, []*ItemTreeEntity{})
	expected := []*ItemTreeEntity{expectedItem1, expectedItem2}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnListItems_shouldHaveLoopStatus_whenChildrenLoop(t *testing.T) {
	// Given
	parent1 := *CreateItemFlatBdd(1, -1, 0, true, TITLE1)
	child1parent1 := *CreateItemFlatBdd(2, 1, 3, false, TITLE2)
	child2parent1 := *CreateItemFlatBdd(3, 1, 4, false, TITLE3)
	child3Parent1 := *CreateItemFlatBdd(4, 1, 2, false, TITLE4)
	itemsFlat := []ItemFlatBdd{parent1, child2parent1, child1parent1, child3Parent1}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expectedChild1Item1 := CreateItemTreeEntity(2, OK, TITLE2, []*ItemTreeEntity{})
	expectedChild2Item1 := CreateItemTreeEntity(3, OK, TITLE3, []*ItemTreeEntity{})
	expectedChild3Item1 := CreateItemTreeEntity(4, LOOP, TITLE4, []*ItemTreeEntity{})
	expectedItem1 := CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{expectedChild1Item1, expectedChild2Item1, expectedChild3Item1})
	expected := []*ItemTreeEntity{expectedItem1}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnListItems_shouldHaveLoopStatus_whenTwoChildrenLoop(t *testing.T) {
	// Given
	parent1 := *CreateItemFlatBdd(1, -1, 0, true, TITLE1)
	child1parent1 := *CreateItemFlatBdd(2, 1, 2, false, TITLE2)
	child2parent1 := *CreateItemFlatBdd(3, 1, 4, false, TITLE3)
	child3Parent1 := *CreateItemFlatBdd(4, 1, 3, false, TITLE4)
	itemsFlat := []ItemFlatBdd{parent1, child2parent1, child1parent1, child3Parent1}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expectedChild1Item1 := CreateItemTreeEntity(2, LOOP, TITLE2, []*ItemTreeEntity{})
	expectedChild2Item1 := CreateItemTreeEntity(3, OK, TITLE3, []*ItemTreeEntity{})
	expectedChild3Item1 := CreateItemTreeEntity(4, LOOP, TITLE4, []*ItemTreeEntity{})
	expectedItem1 := CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{expectedChild1Item1, expectedChild2Item1, expectedChild3Item1})
	expected := []*ItemTreeEntity{expectedItem1}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnListItems_shouldHaveOrphanNextNotFoundStatus_whenTreesWithTotalOrphan(t *testing.T) {
	// Given
	parent1 := *CreateItemFlatBdd(1, -1, 0, true, TITLE1)
	parent2 := *CreateItemFlatBdd(4, -1, 5, false, TITLE4)
	child1parent2 := *CreateItemFlatBdd(2, 4, 3, false, TITLE2)
	child2parent2 := *CreateItemFlatBdd(3, 4, 10, false, TITLE3)
	itemsFlat := []ItemFlatBdd{parent1, child2parent2, child1parent2, parent2}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expectedChild1Item2 := CreateItemTreeEntity(2, OK, TITLE2, []*ItemTreeEntity{})
	expectedChild2Item2 := CreateItemTreeEntity(3, NEXT_NOT_FOUND, TITLE3, []*ItemTreeEntity{})
	expectedItem1 := CreateItemTreeEntity(1, ORPHAN, TITLE1, []*ItemTreeEntity{})
	expectedItem2 := CreateItemTreeEntity(4, TOTAL_ORPHAN, TITLE4, []*ItemTreeEntity{expectedChild1Item2, expectedChild2Item2})
	expected := []*ItemTreeEntity{expectedItem1, expectedItem2}
	assert.Equal(t, expected, actual)
}

func TestConvertFlatToTree_shouldReturnListItems_shouldAllStatusOk_whenNextIdsCorrect(t *testing.T) {
	itemsFlat := []ItemFlatBdd{
		*CreateItemFlatBdd(1, -1, 2, false, TITLE1),
		*CreateItemFlatBdd(2, -1, 0, true, TITLE2),
	}
	// When
	actual := ConvertFlatToTree[ItemFlatBdd, *ItemTreeEntity](itemsFlat)
	// Then
	expectedItem1 := CreateItemTreeEntity(1, OK, TITLE1, []*ItemTreeEntity{})
	expectedItem2 := CreateItemTreeEntity(2, OK, TITLE2, []*ItemTreeEntity{})
	expected := []*ItemTreeEntity{expectedItem1, expectedItem2}
	assert.Equal(t, expected, actual)
}
