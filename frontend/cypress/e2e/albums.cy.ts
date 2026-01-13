describe('Albums', () => {
  const testEmail = `e2e-albums-${Date.now()}@example.com`

  before(() => {
    cy.register('Albums Test User', testEmail, 'Test@123')
  })

  beforeEach(() => {
    cy.login(testEmail, 'Test@123')
  })

  describe('Albums List', () => {
    it('should display empty state when no albums exist', () => {
      cy.visit('/albums')

      cy.contains('Nenhum álbum ainda').should('be.visible')
      cy.contains('Criar álbum').should('be.visible')
    })

    it('should create a new album', () => {
      cy.visit('/albums')

      cy.contains('Criar álbum').click()

      cy.get('input[name="title"]').type('E2E Test Album')
      cy.get('textarea[name="description"]').type('Album created by E2E test')
      cy.get('button[type="submit"]').click()

      cy.contains('Álbum criado com sucesso').should('be.visible')
      cy.contains('E2E Test Album').should('be.visible')
    })

    it('should navigate to album detail page', () => {
      cy.visit('/albums')

      cy.contains('E2E Test Album').click()

      cy.url().should('match', /\/albums\/[a-z0-9-]+/)
      cy.contains('E2E Test Album').should('be.visible')
    })
  })

  describe('Album Detail', () => {
    it('should display empty photos state', () => {
      cy.visit('/albums')
      cy.contains('E2E Test Album').click()

      cy.contains('Nenhuma foto ainda').should('be.visible')
      cy.contains('Adicionar fotos').should('be.visible')
    })

    it('should open upload modal', () => {
      cy.visit('/albums')
      cy.contains('E2E Test Album').click()

      cy.contains('Adicionar fotos').click()

      cy.contains('Arraste imagens').should('be.visible')
    })

    it('should toggle share status', () => {
      cy.visit('/albums')
      cy.contains('E2E Test Album').click()

      cy.get('[aria-label="Compartilhar álbum"]').click()

      cy.contains('Link copiado').should('be.visible')
    })

    it('should edit album title', () => {
      cy.visit('/albums')
      cy.contains('E2E Test Album').click()

      cy.get('[aria-label="Editar álbum"]').click()

      cy.get('input[name="title"]').clear().type('Updated Album Title')
      cy.get('button[type="submit"]').click()

      cy.contains('Álbum atualizado com sucesso').should('be.visible')
      cy.contains('Updated Album Title').should('be.visible')
    })
  })

  describe('Album Deletion', () => {
    it('should delete album', () => {
      cy.visit('/albums')
      cy.contains('Updated Album Title').click()

      cy.get('[aria-label="Excluir álbum"]').click()

      cy.contains('Tem certeza').should('be.visible')
      cy.contains('button', 'Excluir').click()

      cy.url().should('include', '/albums')
      cy.contains('Álbum excluído com sucesso').should('be.visible')
    })
  })
})
