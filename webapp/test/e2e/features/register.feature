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

  Scenario: Wrong registration, repeated username
    Given the main page opened and a user already created with username "user123456" and email "user123456@user"
    When I click on "SIGN UP"
    And I enter the username "user123456"
    And I enter the nickname "usernick"
    And I enter the email "user2@user"
    And I enter the password "Test@123456"
    And I click on "SAVE ACCOUNT"
    Then I should see an error


  Scenario: Wrong registration, repeated email
    Given the main page opened and a user already created with username "user1234" and email "user1234@user"
    When I click on "SIGN UP"
    And I enter the username "User123"
    And I enter the nickname "usernick"
    And I enter the email "user1234@user"
    And I enter the password "Test@123456"
    And I click on "SAVE ACCOUNT"
    Then I should see an error