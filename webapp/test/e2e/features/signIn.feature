Feature: User Register
  As an already sign up user, I want to login and play a game.

  Scenario: Successful login
    Given the main page opened
    When I write the username "User"
    And I write the password "Test@123456"
    And I click on "PLAY"
    Then I should see the page for playing