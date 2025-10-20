describe('AI Chat Assistant', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('button', 'Get Started').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      }
    });
    cy.wait(1000);
  });

  it('should display AI Assistant panel', () => {
    cy.contains('AI Assistant').should('be.visible');
  });

  it('should show AI Trading Assistant header', () => {
    cy.contains('AI Trading Assistant').should('be.visible');
  });

  it('should display welcome message', () => {
    cy.contains('Hi! I\'m your AI trading assistant').should('be.visible');
  });

  it('should show suggested questions', () => {
    cy.contains('Should I buy').should('exist').or(
      cy.contains('What\'s the current trend').should('exist')
    );
  });

  it('should have quick action buttons', () => {
    cy.contains('Should I buy?').should('be.visible');
    cy.contains('Trend?').should('be.visible');
    cy.contains('Levels?').should('be.visible');
    cy.contains('Risk?').should('be.visible');
  });

  it('should have input field for questions', () => {
    cy.contains('AI Assistant').parent().within(() => {
      cy.get('input[type="text"]').should('exist');
      cy.get('input[type="text"]').should('have.attr', 'placeholder');
    });
  });

  it('should have send button', () => {
    cy.contains('AI Assistant').parent().within(() => {
      cy.get('button').contains('⬆').should('exist');
    });
  });

  it('should respond to quick action buttons', () => {
    cy.contains('Should I buy?').click();
    cy.wait(1000);
    
    // Should show loading or response
    cy.contains('AI Assistant').parent().within(() => {
      cy.get('.space-y-3').should('exist');
    });
  });

  it('should allow typing and sending custom questions', () => {
    cy.contains('AI Assistant').parent().within(() => {
      cy.get('input[type="text"]').type('What is the current price?');
      cy.get('button').contains('⬆').click();
      cy.wait(1000);
    });
  });

  it('should update responses when trading pair changes', () => {
    // Ask a question
    cy.contains('Should I buy?').click();
    cy.wait(1000);

    // Change pair
    cy.contains('BTC/USD').click();
    cy.contains('ETH/USD').click();
    cy.wait(1000);

    // The assistant should reference the new pair
    cy.contains('AI Assistant').parent().within(() => {
      cy.contains('ETH').should('exist').or(cy.contains('Ethereum').should('exist'));
    });
  });
});
