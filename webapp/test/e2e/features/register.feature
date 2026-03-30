Feature: User Register
  As a new user, I want to create an account to access
  the different features of the game.

  Scenario: Successful registration
    Given the main page opened
    When I click on "SIGN UP"
    And I enter the username "User"
    And I enter the nickname "usernick"
    And I enter the email "user@user"
    And I enter the password "Test@123456"
    And I click on "SAVE ACCOUNT"
    Then I should see the login page