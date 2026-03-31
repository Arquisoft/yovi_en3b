Feature: Bot Match
  As a player, I want to play a game against an AI bot
  so that I can practice without needing another human.

  Scenario: The bot responds to my first move
    Given the main page opened and a user already created with username "player1" and email "player1@test.com"

    When I enter the login username "player1"
    And I enter the login password "Test@123456"
    And I click on "PLAY"
    And I click the main menu play button
    And I click the preview play now button
    And I click on an empty hexagonal cell
    And I confirm my move
    Then the bot should place a piece automatically