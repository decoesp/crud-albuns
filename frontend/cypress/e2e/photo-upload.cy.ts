describe('Photo Upload', () => {
  const testEmail = `e2e-upload-${Date.now()}@example.com`
  let albumId: string

  before(() => {
    cy.register('Upload Test User', testEmail, 'Test@123')

    cy.request({
      method: 'POST',
      url: '/api/albums',
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`
      },
      body: {
        title: 'Upload Test Album',
        description: 'Album for upload tests'
      }
    }).then((response) => {
      albumId = response.body.id
    })
  })

  beforeEach(() => {
    cy.login(testEmail, 'Test@123')
  })

  describe('Upload Modal', () => {
    it('should open upload modal from album detail', () => {
      cy.visit(`/albums/${albumId}`)

      cy.contains('Adicionar fotos').click()

      cy.get('[role="dialog"]').should('be.visible')
      cy.contains('Arraste imagens').should('be.visible')
    })

    it('should have date input with max attribute preventing future dates', () => {
      cy.visit(`/albums/${albumId}`)

      cy.contains('Adicionar fotos').click()

      cy.get('input[type="datetime-local"]').should('have.attr', 'max')
    })

    it('should close modal on cancel', () => {
      cy.visit(`/albums/${albumId}`)

      cy.contains('Adicionar fotos').click()
      cy.get('[role="dialog"]').should('be.visible')

      cy.contains('button', 'Cancelar').click()

      cy.get('[role="dialog"]').should('not.exist')
    })
  })

  describe('Acquisition Date Validation', () => {
    it('should display error toast when trying to upload with future date', () => {
      cy.visit(`/albums/${albumId}`)

      cy.contains('Adicionar fotos').click()

      cy.fixture('test-image.jpg', 'base64').then((fileContent) => {
        cy.get('input[type="file"]').selectFile(
          {
            contents: Cypress.Buffer.from(fileContent, 'base64'),
            fileName: 'test-image.jpg',
            mimeType: 'image/jpeg'
          },
          { force: true }
        )
      })

      cy.get('input[type="datetime-local"]').then(($input) => {
        const futureDate = new Date(Date.now() + 86400000 * 7)
        const formattedDate = futureDate.toISOString().slice(0, 16)

        cy.wrap($input).invoke('removeAttr', 'max')
        cy.wrap($input).type(formattedDate)
      })

      cy.contains('button', 'Enviar').click()

      cy.contains('não pode ser futura').should('be.visible')
    })
  })
})
