package domain

type spaceBuilder struct {
	id       string
	title    string
	text     string
	state    string
	status   string
	children *Spaces
	crudMode string
	newId    string
}

func SpaceBuilder() spaceBuilder {
	return spaceBuilder{}
}

func (b spaceBuilder) WithId(id string) spaceBuilder {
	b.id = id
	return b
}

func (b spaceBuilder) WithTitle(title string) spaceBuilder {
	b.title = title
	return b
}

func (b spaceBuilder) WithText(text string) spaceBuilder {
	b.text = text
	return b
}

func (b spaceBuilder) WithState(state string) spaceBuilder {
	b.state = state
	return b
}

func (b spaceBuilder) WithStatus(status string) spaceBuilder {
	b.status = status
	return b
}

func (b spaceBuilder) WithCrudMode(crudMode string) spaceBuilder {
	b.crudMode = crudMode
	return b
}

func (b spaceBuilder) WithNewId(newId string) spaceBuilder {
	b.newId = newId
	return b
}

func (b spaceBuilder) WithChild(child *Space) spaceBuilder {
	if b.children == nil {
		b.children = new(Spaces)
	}
	b.children.AddSpace(child)
	return b
}

func (b spaceBuilder) Build() *Space {
	space := new(Space)
	space.id = b.id
	space.title = b.title
	space.text = b.text
	space.state = b.state
	space.status = b.status
	space.crudMode = b.crudMode
	if b.children == nil {
		space.children = new(Spaces)
	} else {
		space.children = b.children
	}
	space.new_id = b.newId
	return space
}
