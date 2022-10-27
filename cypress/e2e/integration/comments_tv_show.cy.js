describe('Spotlight of the Movie - comments', () => {
  it("Post Comment", () => {
    cy.visit("localhost:5000/login");
    cy.get("input[id = 'login_username'").type("TESTUSERNAME");
    cy.get("input[id = 'login_password'").type("Testpassword123");
    cy.get("input[id = 'login_submit']").click();

    cy.visit("http://localhost:5000/serial/94997");
    cy.get("body").then(($body) => {
      if ($body.find("div[class=radio--field]").length > 0) {
        cy.get("label[for = 'comment_radio_field-4']").click();
        cy.get("input[id = 'comment_stringfield']").type("TEST! Test! test!");
        cy.get("input[id = 'comment_submit']").click();
      } else {
        cy.log('Komentarz jest już zamieszczony, usuń go z bazy dasnych a następnie przystąp do testu')
      }
    });
  });
})