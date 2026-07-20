package mapper

import (
	"goTool/domain"
)

type SpaceWebResult struct {
	ID       string            `json:"id"`
	Title    string            `json:"title"`
	Text     string            `json:"text"`
	State    string            `json:"state"`
	Children []*SpaceWebResult `json:"children"`
	Status   string            `json:"status"`
	CRUDMode string            `json:"CRUDMode"`
}

func (spaceWebResult SpaceWebResult) ConvertToDomain() *domain.Space {
	space := new(domain.Space)
	space.SetId(spaceWebResult.ID)
	space.SetTitle(spaceWebResult.Title)
	space.SetText(spaceWebResult.Text)
	space.SetState(spaceWebResult.State)
	space.SetStatus(spaceWebResult.Status)
	space.SetCRUDMode(spaceWebResult.CRUDMode)
	spaces := new(domain.Spaces)
	childrenSpace := spaceWebResult.Children
	for _, childSpace := range childrenSpace {
		spaces.AddSpace(childSpace.ConvertToDomain())
	}
	space.SetChildrenSpaces(spaces)
	return space
}

func ConvertSpaceToWebResult(space *domain.Space) *SpaceWebResult {
	spaceWebResult := new(SpaceWebResult)
	spaceWebResult.ID = space.GetId()
	spaceWebResult.Title = space.GetTitle()
	spaceWebResult.Text = space.GetText()
	spaceWebResult.State = space.GetState()
	spaceWebResult.Status = space.GetStatus()
	spaceWebResult.CRUDMode = space.GetCRUDMode()
	foundChildren := space.GetChildrenSpaces().GetList()
	children := make([]*SpaceWebResult, len(foundChildren))
	for index, foundChild := range foundChildren {
		children[index] = ConvertSpaceToWebResult(foundChild)
	}
	spaceWebResult.Children = children
	return spaceWebResult
}
