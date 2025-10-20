describe('Market Data Panel', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.contains('button', 'Get Started').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      }
    });
    cy.wait(1000);
  });

  it('should display market data panel', () => {
    cy.contains('Market Data').should('be.visible');
  });

  it('should show current price', () => {
    cy.contains('Market Data').parent().within(() => {
      cy.get('.text-4xl').should('exist');
      cy.contains('$').should('exist');
    });
  });

  it('should display 24h price change', () => {
    cy.contains('Market Data').parent().within(() => {
      // Should show percentage change
      cy.contains('%').should('exist');
    });
  });

  it('should show OHLC data', () => {
    cy.contains('Market Data').parent().within(() => {
      cy.contains('O:').should('exist');
      cy.contains('H:').should('exist');
      cy.contains('L:').should('exist');
      cy.contains('C:').should('exist');
    });
  });

  it('should display volume information', () => {
    cy.contains('Market Data').parent().within(() => {
      cy.contains('Vol').should('exist');
    });
  });

  it('should update when trading pair changes', () => {
    // Get initial price
    let initialPrice: string;
    cy.contains('Market Data').parent().find('.text-4xl').invoke('text').then((text) => {
      initialPrice = text;
    });

    // Change pair
    cy.contains('BTC/USD').click();
    cy.contains('ETH/USD').click();
    cy.wait(1000);

    // Price should be different
    cy.contains('Market Data').parent().find('.text-4xl').invoke('text').should((text) => {
      expect(text).not.to.equal(initialPrice);
    });
  });
});
