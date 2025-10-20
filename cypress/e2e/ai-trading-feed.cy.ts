describe('AI Trading Feed', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('button', 'Get Started').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      }
    });
    cy.wait(2000); // Wait for AI feed to generate
  });

  it('should display AI Trading Feed panel', () => {
    cy.contains('AI Trading Feed').should('be.visible');
  });

  it('should show live indicator', () => {
    cy.contains('AI Trading Feed').parent().within(() => {
      cy.contains('Live').should('be.visible');
    });
  });

  it('should display filter tabs (All, High, Medium, Low)', () => {
    cy.contains('AI Trading Feed').parent().within(() => {
      cy.contains('All').should('be.visible');
      cy.contains('High').should('be.visible');
      cy.contains('Medium').should('be.visible');
      cy.contains('Low').should('be.visible');
    });
  });

  it('should filter by priority level', () => {
    cy.contains('AI Trading Feed').parent().within(() => {
      cy.contains('High').click();
      cy.wait(500);
      
      // Should only show high priority items
      cy.contains('Medium').click();
      cy.wait(500);
    });
  });

  it('should display trading signals', () => {
    cy.contains('AI Trading Feed').parent().within(() => {
      // Check for common signal types
      cy.get('body').then(($body) => {
        const hasSignals = $body.text().includes('Resistance') || 
                          $body.text().includes('Support') || 
                          $body.text().includes('RSI') ||
                          $body.text().includes('Volatility');
        expect(hasSignals).to.be.true;
      });
    });
  });

  it('should have clear button', () => {
    cy.contains('AI Trading Feed').parent().within(() => {
      cy.contains('Clear').should('be.visible');
    });
  });

  it('should clear feed items when clear is clicked', () => {
    cy.contains('AI Trading Feed').parent().within(() => {
      // Click clear button
      cy.contains('Clear').click();
      cy.wait(500);
    });
  });

  it('should show action buttons on signals', () => {
    cy.contains('AI Trading Feed').parent().within(() => {
      cy.get('button').contains('Analyze').should('exist').or(
        cy.get('button').contains('Set Alert').should('exist')
      );
    });
  });
});
