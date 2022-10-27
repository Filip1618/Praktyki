describe('Spotlight of the Movie - accounts', () => {
  it('Creating new account', () => {
    cy.visit('localhost:5000/register')
    cy.get("input[id = 'register_username'").type("TESTUSERNAME")
    cy.get("input[id = 'register_firstname'").type("TESTFIRSTNAME")
    cy.get("input[id = 'register_lastname'").type("TESTLASTNAME")
    cy.get("input[id = 'register_password'").type("Testpassword123")
    cy.get("input[id = 'register_submit']").click()

    cy.get("body").then(($body) => {
      if ($body.find("p[class='errormsg']").length > 0) {
        cy.log('Taki użytkownik już istnieje');
      }
    });
  })


  it('Logging to account', () => {
    cy.visit('localhost:5000/login')
    cy.get("input[id = 'login_username'").type("TESTUSERNAME")
    cy.get("input[id = 'login_password'").type("Testpassword123")
    cy.get("input[id = 'login_submit']").click()
  })

  it('Logout', () => {
    cy.visit('localhost:5000/login')
    cy.get("input[id = 'login_username'").type("TESTUSERNAME")
    cy.get("input[id = 'login_password'").type("Testpassword123")
    cy.get("input[id = 'login_submit']").click()
    cy.contains('a', 'Wyloguj').click()
  })
})