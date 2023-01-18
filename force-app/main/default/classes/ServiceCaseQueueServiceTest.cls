@isTest
private class ServiceCaseQueueServiceTest {
  @isTest
  static void getUserCasesTestOneResult() {
    Case testCase = new Case();
    String currentUserId = UserInfo.getUserId();

    Test.startTest();
    insert testCase;
    List<Case> result = ServiceCaseQueueService.getUserCases();
    Test.stopTest();

    System.assert(result.size() == 1);
    Case actual = result[0];
    System.assertEquals(currentUserId, actual.OwnerId);
  }

  @isTest
  static void getUserCasesTestNoResults() {
    Case testCase = new Case();
    String currentUserId = UserInfo.getUserId();

    Test.startTest();
    User u = [SELECT id FROM User WHERE id != :currentUserId LIMIT 1];
    System.runAs(u) {
      insert testCase;
    }
    List<Case> result = ServiceCaseQueueService.getUserCases();
    Test.stopTest();

    System.assert(result.isEmpty());
  }
}
