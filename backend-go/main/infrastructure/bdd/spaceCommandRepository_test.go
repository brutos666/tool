package bdd

import (
	"context"

	"goTool/domain"
	"goTool/infrastructure/mock"

	"github.com/mvrahden/go-test/pkg/gotest"
)

const SPACE_ID = "spaceId"

type SpaceCommandRepositoryTestSuite struct {
	repo domain.SpaceCommandRepository
	srv  mock.BddServiceMock
}

func (s *SpaceCommandRepositoryTestSuite) BeforeEach(t *gotest.T) {
	s.repo = SpaceCommandRepository()
	s.srv = mock.BddAccessServiceMock()
	InitAccessService(s.srv)
}

func (s *SpaceCommandRepositoryTestSuite) TestSaveCurrentSpace(t *gotest.T) {
	t.It("Pas d'espace", func(it *gotest.T) {
		err := s.repo.SaveCurrentSpace(context.TODO(), 0, nil)
		gotest.NoError(it, err)
	})
	t.When("Sauvegarde avec un espace à l'état supprimé", func(w *gotest.T) {
		space := domain.SpaceBuilder().WithId("spaceId").WithTitle("Espace à supprimer").WithCrudMode(domain.DELETE).Build()
		nodeSpace := domain.CreateNodeSpace(space, "", "", "")
		err := s.repo.SaveCurrentSpace(context.TODO(), 0, nodeSpace)
		w.It("pas d'erreur", func(it *gotest.T) {
			gotest.NoError(it, err)
		})
		w.It("la base de données est appelée pour supprimer l'espace", func(it *gotest.T) {
			bddWriteMock := s.srv.RetrieveMockAccessWrite()
			gotest.ElementsMatch(it, bddWriteMock.GetDeleteIds(), []string{SPACE_ID})
		})
	})
	/*
		t.When("Pas d'espace", func(w *gotest.T) {
			err := s.repo.SaveCurrentSpace(nil, s.dataAccessId, nodeSpace)
			w.It("rien ne se passe", func(it *gotest.T) {
				expectedError := domainMessage.TokenErrorf(NOT_LOGGED)
				expectedError.SetTokenAbsent()
				gotest.ErrorIs(it, err, expectedError)
				gotest.Zero(it, connectedUser)
			})
		})
	*/
}

/*
func Benchmarkxxx(b *testing.B) {
	for b.Loop() {
		//_ = xxx
	}
}
*/
