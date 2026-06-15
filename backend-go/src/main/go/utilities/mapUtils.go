package utilities


func GroupBy[K comparable, E any](entityList []E, getKeyFunc func(E) K) (map[K][]E) {
	entitiesGroupByKeyFunc := make(map[K][]E)
	var entities []E
	for _, entity := range entityList {
		key := getKeyFunc(entity)
		entities = entitiesGroupByKeyFunc[key]
		if (entities == nil) {
			entities = make([]E, 0)
		}
		entitiesGroupByKeyFunc[key] = append(entities, entity)
	}
	return entitiesGroupByKeyFunc
}