@isTest
private class AccountCasesPdfCtrlTest {
  private static final Integer NUMBER_OF_DAYS_IN_WEEK = 7;
  
  @isTest
  static void getAccountCasesPrevWeekTestOneResult() {
    Case testCase = new Case();
    insert testCase;
    Test.setCreatedDate(
      testCase.Id,
      System.today().toStartOfWeek().addDays(-2)
    );
    Test.startTest();
    List<Case> result = new AccountCasesPdfCtrl().getAccountCasesPrevWeek();
    Test.stopTest();

    System.assert(!result.isEmpty());
    System.assert(result.size() == 1);
    Case actual = result[0];
    System.assertEquals(testCase.Id, actual.Id);
  }

  @isTest
  static void getAccountCasesPrevWeekTestNoResults() {
    Case testCase = new Case();
    insert testCase;
    Test.setCreatedDate(
      testCase.Id,
      Date.today().addDays(-(NUMBER_OF_DAYS_IN_WEEK * 2))
    );

    Test.startTest();
    List<Case> result = new AccountCasesPdfCtrl().getAccountCasesPrevWeek();
    Test.stopTest();

    System.assert(result.isEmpty());
  }
}
